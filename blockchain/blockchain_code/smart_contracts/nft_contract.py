# nft_contract.py

class NFTContract:
    def __init__(self, contract_owner):
        self.contract_owner = contract_owner
        self.nfts = {}
        self.token_counter = 0

    def mint_nft(self, recipient, metadata_uri, minter):
        # In a PoA sidechain, minting might be restricted to specific authorities or pre-defined logic
        # For this example, only the contract owner can mint
        if minter != self.contract_owner:
            print("Only the contract owner can mint new NFTs.")
            return None

        self.token_counter += 1
        token_id = self.token_counter
        self.nfts[token_id] = {
            "owner": recipient,
            "metadata_uri": metadata_uri,
            "royalty_percentage": 0 # Placeholder for future royalty implementation
        }
        print(f"Minted NFT with ID {token_id} for {recipient} with metadata {metadata_uri}")
        return token_id

    def transfer_nft(self, sender, recipient, token_id):
        if token_id not in self.nfts:
            print(f"NFT with ID {token_id} does not exist.")
            return False
        if self.nfts[token_id]["owner"] != sender:
            print(f"Sender {sender} is not the owner of NFT {token_id}.")
            return False

        self.nfts[token_id]["owner"] = recipient
        print(f"Transferred NFT {token_id} from {sender} to {recipient}")
        return True

    def get_nft_owner(self, token_id):
        if token_id in self.nfts:
            return self.nfts[token_id]["owner"]
        return None

    def get_nft_metadata(self, token_id):
        if token_id in self.nfts:
            return self.nfts[token_id]["metadata_uri"]
        return None

    def get_nfts_by_owner(self, owner_address):
        owned_nfts = []
        for token_id, data in self.nfts.items():
            if data["owner"] == owner_address:
                owned_nfts.append(token_id)
        return owned_nfts

# Example Usage (for testing purposes)
if __name__ == "__main__":
    contract_owner_address = "HARVEST_NFT_Admin"
    nft_contract = NFTContract(contract_owner_address)

    user1 = "UserA"
    user2 = "UserB"

    print("\n--- Minting NFTs ---")
    # Mint 3125 NFTs as requested by the user
    for i in range(1, 3126):
        metadata_uri = f"ipfs://QmVy.../{i}.json" # Placeholder URI
        nft_contract.mint_nft(user1, metadata_uri, contract_owner_address)

    print(f"\nTotal NFTs minted: {nft_contract.token_counter}")
    print(f"UserA owns: {nft_contract.get_nfts_by_owner(user1)}")

    print("\n--- Transferring an NFT ---")
    # Assuming NFT with ID 1 was minted for UserA
    if nft_contract.transfer_nft(user1, user2, 1):
        print(f"Owner of NFT 1: {nft_contract.get_nft_owner(1)}")

    print("\n--- Attempting unauthorized mint ---")
    nft_contract.mint_nft(user2, "ipfs://new_nft.json", user1) # Should fail

    print("\n--- UserB owns: ---")
    print(nft_contract.get_nfts_by_owner(user2))


