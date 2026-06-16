module defai_agent::axis_vault {
    use sui::balance::{Self, Balance};
    use sui::coin::{Self, Coin, TreasuryCap};
    use sui::event;
    use defai_agent::pusdc::PUSDC;
    use defai_agent::predict;

    // --- Error Codes ---
    const EZeroAmount: u64 = 1001;
    const EInsufficientShares: u64 = 1002;
    const EAllocationLimitExceeded: u64 = 4001; // Matches frontend simulator code
    const EInvalidAllocationBps: u64 = 1003;

    // --- Capabilities & State ---

    /// Admin Capability to manage vault parameters
    public struct AdminCap has key, store {
        id: UID
    }

    /// Agent Capability held by off-chain Express.js backend to execute strategy
    public struct AgentCap has key, store {
        id: UID
    }

    /// Shared Vault Object
    public struct Vault<phantom DUSDC> has key {
        id: UID,
        cash_balance: Balance<DUSDC>,
        treasury_cap: TreasuryCap<PUSDC>,
        total_shares: u64,
        max_allocation_bps: u64 // Default 20.00% (2000 bps)
    }

    // --- Events ---
    public struct StrategyExecuted has copy, drop {
        amount: u64,
        base_price: u64,
        range_width: u64,
        timestamp: u64
    }

    public struct VaultCreated has copy, drop {
        vault_id: ID
    }

    // --- Constructor ---
    fun init(ctx: &mut TxContext) {
        let admin = AdminCap { id: object::new(ctx) };
        transfer::public_transfer(admin, ctx.sender());
    }

    // --- Public Entry / Mutative Functions ---

    /// Creates and shares a new Vault. Admin must pass the TreasuryCap of PUSDC.
    public fun create_vault<DUSDC>(
        _admin: &AdminCap,
        treasury_cap: TreasuryCap<PUSDC>,
        ctx: &mut TxContext
    ) {
        let vault = Vault<DUSDC> {
            id: object::new(ctx),
            cash_balance: balance::zero(),
            treasury_cap,
            total_shares: 0,
            max_allocation_bps: 2000 // 20.00%
        };
        event::emit(VaultCreated { vault_id: object::id(&vault) });
        transfer::share_object(vault);
    }

    /// Issues an AgentCap for a backend bot
    public fun issue_agent_cap(
        _admin: &AdminCap,
        ctx: &mut TxContext
    ): AgentCap {
        AgentCap { id: object::new(ctx) }
    }

    /// Updates Vault max_allocation_bps (hard-capped at 2000 bps / 20.00%)
    public fun update_max_allocation<DUSDC>(
        _admin: &AdminCap,
        vault: &mut Vault<DUSDC>,
        new_bps: u64
    ) {
        assert!(new_bps <= 2000, EInvalidAllocationBps);
        vault.max_allocation_bps = new_bps;
    }

    /// User deposits dUSDC and receives tokenized shares ($pUSDC)
    public fun deposit<DUSDC>(
        vault: &mut Vault<DUSDC>,
        payment: Coin<DUSDC>,
        ctx: &mut TxContext
    ): Coin<PUSDC> {
        let amount = coin::value(&payment);
        assert!(amount > 0, EZeroAmount);

        let payment_balance = coin::into_balance(payment);
        
        // Calculate shares before joining balance (to get TVL before deposit)
        let tvl = balance::value(&vault.cash_balance);
        let shares_to_mint = if (vault.total_shares == 0 || tvl == 0) {
            amount
        } else {
            (((amount as u128) * (vault.total_shares as u128) / (tvl as u128)) as u64)
        };

        balance::join(&mut vault.cash_balance, payment_balance);
        vault.total_shares = vault.total_shares + shares_to_mint;

        // Mint and return shares
        coin::mint(&mut vault.treasury_cap, shares_to_mint, ctx)
    }

    /// User redeems shares ($pUSDC) to withdraw dUSDC
    public fun withdraw<DUSDC>(
        vault: &mut Vault<DUSDC>,
        shares: Coin<PUSDC>,
        ctx: &mut TxContext
    ): Coin<DUSDC> {
        let shares_amount = coin::value(&shares);
        assert!(shares_amount > 0, EZeroAmount);
        assert!(vault.total_shares >= shares_amount, EInsufficientShares);

        let tvl = balance::value(&vault.cash_balance);
        let amount_to_return = (((shares_amount as u128) * (tvl as u128) / (vault.total_shares as u128)) as u64);

        vault.total_shares = vault.total_shares - shares_amount;
        coin::burn(&mut vault.treasury_cap, shares);

        let return_balance = balance::split(&mut vault.cash_balance, amount_to_return);
        coin::from_balance(return_balance, ctx)
    }

    /// AI Agent executes strategy: splits dUSDC from Vault, validates 20% TVL limit, and mints range on DeepBook
    public fun execute_strategy<DUSDC>(
        _agent: &AgentCap,
        vault: &mut Vault<DUSDC>,
        requested_amount: u64,
        base_price: u64,
        range_width: u64,
        ctx: &mut TxContext
    ) {
        // Enforce Risk-Adjusted Guardrails (max 20% TVL allocation per transaction)
        let vault_value = balance::value(&vault.cash_balance);
        let max_alloc = (vault_value * vault.max_allocation_bps) / 10000;
        assert!(requested_amount <= max_alloc, EAllocationLimitExceeded);

        // Deduct allocation from Vault cash balance
        let allocate_balance = balance::split(&mut vault.cash_balance, requested_amount);
        let allocate_coin = coin::from_balance(allocate_balance, ctx);

        // Call the simulated DeepBook Predict range minting
        predict::mint_range(allocate_coin, base_price, range_width, ctx);

        // Emit StrategyExecuted event on-chain
        event::emit(StrategyExecuted {
            amount: requested_amount,
            base_price,
            range_width,
            timestamp: tx_context::epoch_timestamp_ms(ctx)
        });
    }

    // --- Read-Only Getters ---
    public fun get_tvl<DUSDC>(vault: &Vault<DUSDC>): u64 {
        balance::value(&vault.cash_balance)
    }

    public fun get_total_shares<DUSDC>(vault: &Vault<DUSDC>): u64 {
        vault.total_shares
    }

    public fun get_max_allocation_bps<DUSDC>(vault: &Vault<DUSDC>): u64 {
        vault.max_allocation_bps
    }
}
