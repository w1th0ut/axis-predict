module defai_agent::predict {
    use sui::coin::Coin;

    public struct Range has key, store {
        id: UID,
        base_price: u64,
        range_width: u64,
        amount: u64
    }

    /// Mock function simulating predict::mint_range from DeepBook Predict
    public fun mint_range<DUSDC>(
        payment: Coin<DUSDC>,
        base_price: u64,
        range_width: u64,
        ctx: &mut TxContext
    ) {
        let amount = sui::coin::value(&payment);
        let range = Range {
            id: object::new(ctx),
            base_price,
            range_width,
            amount
        };
        
        // Transfer mock range object to the transaction sender
        sui::transfer::public_transfer(range, ctx.sender());
        // Transfer mock payment back or handle custody (in mock, we return it to simulate custody)
        sui::transfer::public_transfer(payment, ctx.sender());
    }
}
