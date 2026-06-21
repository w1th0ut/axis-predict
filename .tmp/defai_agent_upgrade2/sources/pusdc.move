module defai_agent::pusdc {
    use sui::coin;

    /// One-Time Witness for the PUSDC coin type
    public struct PUSDC has drop {}

    fun init(witness: PUSDC, ctx: &mut TxContext) {
        let (treasury_cap, metadata) = coin::create_currency(
            witness,
            9, // 9 decimal places
            b"pUSDC",
            b"Axis Predict Vault Share",
            b"Tokenized liquid share for Axis Predict Vault positions",
            option::none(),
            ctx
        );
        
        // Share the metadata publicly so wallets can read details
        sui::transfer::public_share_object(metadata);
        // Transfer the treasury capability to the publisher (creator of the contract)
        sui::transfer::public_transfer(treasury_cap, ctx.sender());
    }
}
