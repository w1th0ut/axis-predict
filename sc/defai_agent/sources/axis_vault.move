module defai_agent::axis_vault {
    use defai_agent::pusdc::PUSDC;
    use sui::balance::{Self, Balance};
    use sui::coin::{Self, Coin, TreasuryCap};
    use sui::event;

    const EZeroAmount: u64 = 1001;
    const EInsufficientShares: u64 = 1002;
    const EInvalidAllocationBps: u64 = 1003;
    const EInsufficientLiquidBalance: u64 = 1004;
    const EAllocationLimitExceeded: u64 = 4001;
    const EInvalidStrategyTicket: u64 = 4002;
    const EAccountingUnderflow: u64 = 4003;

    /// Admin capability used to initialize the shared vault and mint agent caps.
    public struct AdminCap has key, store {
        id: UID,
    }

    /// Capability assigned to the backend agent that is allowed to open/settle
    /// Predict positions on behalf of the shared vault.
    public struct AgentCap has key, store {
        id: UID,
    }

    /// Shared vault that holds liquid dUSDC plus accounting for capital that is
    /// temporarily deployed into DeepBook Predict through the backend agent.
    public struct Vault<phantom DUSDC> has key {
        id: UID,
        cash_balance: Balance<DUSDC>,
        deployed_balance: u64,
        treasury_cap: TreasuryCap<PUSDC>,
        total_shares: u64,
        max_allocation_bps: u64,
        strategy_nonce: u64,
        cumulative_profit: u64,
        cumulative_loss: u64,
    }

    /// Receipt object for one active strategy deployment. The backend agent
    /// keeps this object and must present it to settle capital back into the
    /// vault after a Predict range has been redeemed.
    public struct StrategyTicket has key, store {
        id: UID,
        vault_id: ID,
        sequence: u64,
        allocated_amount: u64,
        quantity: u64,
        predict_id: ID,
        manager_id: ID,
        oracle_id: ID,
        expiry: u64,
        lower_strike: u64,
        higher_strike: u64,
        opened_at_ms: u64,
    }

    public struct VaultCreated has copy, drop {
        vault_id: ID,
    }

    public struct StrategyAllocated has copy, drop {
        vault_id: ID,
        ticket_id: ID,
        sequence: u64,
        allocated_amount: u64,
        quantity: u64,
        predict_id: ID,
        manager_id: ID,
        oracle_id: ID,
        expiry: u64,
        lower_strike: u64,
        higher_strike: u64,
        available_liquidity_after: u64,
        timestamp_ms: u64,
    }

    public struct StrategySettled has copy, drop {
        vault_id: ID,
        ticket_id: ID,
        sequence: u64,
        allocated_amount: u64,
        quantity: u64,
        returned_amount: u64,
        realized_profit: u64,
        realized_loss: u64,
        available_liquidity_after: u64,
        timestamp_ms: u64,
    }

    fun init(ctx: &mut TxContext) {
        let admin = AdminCap {
            id: object::new(ctx),
        };
        transfer::public_transfer(admin, ctx.sender());
    }

    public fun create_vault<DUSDC>(
        _admin: &AdminCap,
        treasury_cap: TreasuryCap<PUSDC>,
        ctx: &mut TxContext,
    ) {
        let vault = Vault<DUSDC> {
            id: object::new(ctx),
            cash_balance: balance::zero(),
            deployed_balance: 0,
            treasury_cap,
            total_shares: 0,
            max_allocation_bps: 2000,
            strategy_nonce: 0,
            cumulative_profit: 0,
            cumulative_loss: 0,
        };
        event::emit(VaultCreated {
            vault_id: object::id(&vault),
        });
        transfer::share_object(vault);
    }

    public fun issue_agent_cap(_admin: &AdminCap, ctx: &mut TxContext): AgentCap {
        AgentCap {
            id: object::new(ctx),
        }
    }

    public fun update_max_allocation<DUSDC>(
        _admin: &AdminCap,
        vault: &mut Vault<DUSDC>,
        new_bps: u64,
    ) {
        assert!(new_bps <= 2000, EInvalidAllocationBps);
        vault.max_allocation_bps = new_bps;
    }

    /// User deposits dUSDC and receives pUSDC vault shares. Share pricing uses
    /// total accounted value: liquid cash plus capital currently deployed by
    /// the backend agent.
    public fun deposit<DUSDC>(
        vault: &mut Vault<DUSDC>,
        payment: Coin<DUSDC>,
        ctx: &mut TxContext,
    ): Coin<PUSDC> {
        let amount = coin::value(&payment);
        assert!(amount > 0, EZeroAmount);

        let vault_value = accounted_value(vault);
        let shares_to_mint = if (vault.total_shares == 0 || vault_value == 0) {
            amount
        } else {
            (((amount as u128) * (vault.total_shares as u128) / (vault_value as u128)) as u64)
        };

        balance::join(&mut vault.cash_balance, coin::into_balance(payment));
        vault.total_shares = vault.total_shares + shares_to_mint;
        coin::mint(&mut vault.treasury_cap, shares_to_mint, ctx)
    }

    /// User redeems pUSDC into liquid dUSDC. Withdrawals are limited to liquid
    /// cash currently held in the vault; deployed capital must be settled back
    /// by the agent before it becomes withdrawable.
    public fun withdraw<DUSDC>(
        vault: &mut Vault<DUSDC>,
        shares: Coin<PUSDC>,
        ctx: &mut TxContext,
    ): Coin<DUSDC> {
        let shares_amount = coin::value(&shares);
        assert!(shares_amount > 0, EZeroAmount);
        assert!(vault.total_shares >= shares_amount, EInsufficientShares);

        let vault_value = accounted_value(vault);
        let amount_to_return = (((shares_amount as u128) * (vault_value as u128) / (vault.total_shares as u128)) as u64);
        let available_liquidity = balance::value(&vault.cash_balance);
        assert!(amount_to_return <= available_liquidity, EInsufficientLiquidBalance);

        vault.total_shares = vault.total_shares - shares_amount;
        coin::burn(&mut vault.treasury_cap, shares);

        let return_balance = balance::split(&mut vault.cash_balance, amount_to_return);
        coin::from_balance(return_balance, ctx)
    }

    /// Releases exact dUSDC capital from the vault to the backend agent so it
    /// can be deposited into an agent-owned PredictManager inside the same PTB.
    /// Returns both the coin and a strategy receipt that must be burned later
    /// when funds are settled back into the vault.
    public fun allocate_range_position<DUSDC>(
        _agent: &AgentCap,
        vault: &mut Vault<DUSDC>,
        requested_amount: u64,
        quantity: u64,
        predict_id: ID,
        manager_id: ID,
        oracle_id: ID,
        expiry: u64,
        lower_strike: u64,
        higher_strike: u64,
        ctx: &mut TxContext,
    ): (Coin<DUSDC>, StrategyTicket) {
        assert!(requested_amount > 0, EZeroAmount);
        assert!(quantity > 0, EZeroAmount);

        let available_liquidity = balance::value(&vault.cash_balance);
        assert!(requested_amount <= available_liquidity, EInsufficientLiquidBalance);

        let max_allocation = (accounted_value(vault) * vault.max_allocation_bps) / 10000;
        assert!(requested_amount <= max_allocation, EAllocationLimitExceeded);

        vault.deployed_balance = vault.deployed_balance + requested_amount;
        vault.strategy_nonce = vault.strategy_nonce + 1;

        let capital = coin::from_balance(balance::split(&mut vault.cash_balance, requested_amount), ctx);
        let ticket = StrategyTicket {
            id: object::new(ctx),
            vault_id: object::id(vault),
            sequence: vault.strategy_nonce,
            allocated_amount: requested_amount,
            quantity,
            predict_id,
            manager_id,
            oracle_id,
            expiry,
            lower_strike,
            higher_strike,
            opened_at_ms: tx_context::epoch_timestamp_ms(ctx),
        };

        event::emit(StrategyAllocated {
            vault_id: object::id(vault),
            ticket_id: object::id(&ticket),
            sequence: ticket.sequence,
            allocated_amount: requested_amount,
            quantity,
            predict_id,
            manager_id,
            oracle_id,
            expiry,
            lower_strike,
            higher_strike,
            available_liquidity_after: balance::value(&vault.cash_balance),
            timestamp_ms: ticket.opened_at_ms,
        });

        (capital, ticket)
    }

    /// Accepts returned dUSDC from the backend agent after a Predict position is
    /// redeemed or otherwise unwound. The matching strategy ticket is consumed
    /// and the vault realizes profit/loss from the returned amount.
    public fun settle_range_position<DUSDC>(
        _agent: &AgentCap,
        vault: &mut Vault<DUSDC>,
        ticket: StrategyTicket,
        returned_capital: Coin<DUSDC>,
        ctx: &TxContext,
    ) {
        let returned_amount = coin::value(&returned_capital);
        settle_range_position_internal(
            vault,
            ticket,
            returned_amount,
            option::some(coin::into_balance(returned_capital)),
            ctx,
        );
    }

    /// Closes a strategy ticket with zero returned capital. This is used when a
    /// range expires worthless and the agent has no dUSDC left to pull out of
    /// its PredictManager.
    public fun settle_range_position_empty<DUSDC>(
        _agent: &AgentCap,
        vault: &mut Vault<DUSDC>,
        ticket: StrategyTicket,
        ctx: &TxContext,
    ) {
        settle_range_position_internal(vault, ticket, 0, option::none(), ctx);
    }

    fun settle_range_position_internal<DUSDC>(
        vault: &mut Vault<DUSDC>,
        ticket: StrategyTicket,
        returned_amount: u64,
        returned_balance: option::Option<Balance<DUSDC>>,
        ctx: &TxContext,
    ) {
        let ticket_id = object::id(&ticket);
        let vault_id = object::id(vault);

        assert!(ticket.vault_id == vault_id, EInvalidStrategyTicket);
        assert!(vault.deployed_balance >= ticket.allocated_amount, EAccountingUnderflow);

        vault.deployed_balance = vault.deployed_balance - ticket.allocated_amount;
        if (option::is_some(&returned_balance)) {
            balance::join(&mut vault.cash_balance, option::destroy_some(returned_balance));
        } else {
            option::destroy_none(returned_balance);
        };

        let realized_profit = if (returned_amount > ticket.allocated_amount) {
            returned_amount - ticket.allocated_amount
        } else {
            0
        };
        let realized_loss = if (returned_amount < ticket.allocated_amount) {
            ticket.allocated_amount - returned_amount
        } else {
            0
        };

        vault.cumulative_profit = vault.cumulative_profit + realized_profit;
        vault.cumulative_loss = vault.cumulative_loss + realized_loss;

        event::emit(StrategySettled {
            vault_id,
            ticket_id,
            sequence: ticket.sequence,
            allocated_amount: ticket.allocated_amount,
            quantity: ticket.quantity,
            returned_amount,
            realized_profit,
            realized_loss,
            available_liquidity_after: balance::value(&vault.cash_balance),
            timestamp_ms: tx_context::epoch_timestamp_ms(ctx),
        });

        let StrategyTicket {
            id,
            vault_id: _,
            sequence: _,
            allocated_amount: _,
            quantity: _,
            predict_id: _,
            manager_id: _,
            oracle_id: _,
            expiry: _,
            lower_strike: _,
            higher_strike: _,
            opened_at_ms: _,
        } = ticket;
        id.delete();
    }

    public fun get_tvl<DUSDC>(vault: &Vault<DUSDC>): u64 {
        accounted_value(vault)
    }

    public fun get_available_liquidity<DUSDC>(vault: &Vault<DUSDC>): u64 {
        balance::value(&vault.cash_balance)
    }

    public fun get_deployed_balance<DUSDC>(vault: &Vault<DUSDC>): u64 {
        vault.deployed_balance
    }

    public fun get_total_shares<DUSDC>(vault: &Vault<DUSDC>): u64 {
        vault.total_shares
    }

    public fun get_max_allocation_bps<DUSDC>(vault: &Vault<DUSDC>): u64 {
        vault.max_allocation_bps
    }

    public fun get_cumulative_profit<DUSDC>(vault: &Vault<DUSDC>): u64 {
        vault.cumulative_profit
    }

    public fun get_cumulative_loss<DUSDC>(vault: &Vault<DUSDC>): u64 {
        vault.cumulative_loss
    }

    fun accounted_value<DUSDC>(vault: &Vault<DUSDC>): u64 {
        balance::value(&vault.cash_balance) + vault.deployed_balance
    }
}
