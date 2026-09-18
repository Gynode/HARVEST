class HRVCoin:
    def __init__(self, initial_supply, owner):
        self.total_supply = initial_supply
        self.balances = {owner: initial_supply}
        self.owner = owner

    def get_total_supply(self):
        return self.total_supply

    def get_balance(self, address):
        return self.balances.get(address, 0)

    def transfer(self, sender, recipient, amount):
        if self.balances.get(sender, 0) < amount:
            print(f"Insufficient balance for {sender}")
            return False
        if amount <= 0:
            print("Transfer amount must be positive")
            return False

        self.balances[sender] -= amount
        self.balances[recipient] = self.balances.get(recipient, 0) + amount
        print(f"Transferred {amount} HRV from {sender} to {recipient}")
        return True

    def mint(self, recipient, amount, minter):
        # In a PoA sidechain, minting might be restricted to specific authorities or pre-defined logic
        # For this example, only the owner can mint
        if minter != self.owner:
            print("Only the owner can mint new coins.")
            return False
        if amount <= 0:
            print("Mint amount must be positive")
            return False

        self.total_supply += amount
        self.balances[recipient] = self.balances.get(recipient, 0) + amount
        print(f"Minted {amount} HRV for {recipient}. New total supply: {self.total_supply}")
        return True

    def burn(self, sender, amount):
        if self.balances.get(sender, 0) < amount:
            print(f"Insufficient balance for {sender}")
            return False
        if amount <= 0:
            print("Burn amount must be positive")
            return False

        self.balances[sender] -= amount
        self.total_supply -= amount
        print(f"Burned {amount} HRV from {sender}. New total supply: {self.total_supply}")
        return True

# Example Usage (for testing purposes)
if __name__ == "__main__":
    initial_supply = 1000000000  # 1 billion HRV
    owner_address = "HARVEST_Foundation"
    hrv = HRVCoin(initial_supply, owner_address)

    print(f"Initial Total Supply: {hrv.get_total_supply()}")
    print(f"Owner Balance: {hrv.get_balance(owner_address)}")

    user1 = "UserA"
    user2 = "UserB"

    print("\n--- Transfers ---")
    hrv.transfer(owner_address, user1, 1000000)
    hrv.transfer(user1, user2, 500000)
    hrv.transfer(user2, owner_address, 200000)

    print(f"\nUserA Balance: {hrv.get_balance(user1)}")
    print(f"UserB Balance: {hrv.get_balance(user2)}")
    print(f"Owner Balance: {hrv.get_balance(owner_address)}")

    print("\n--- Minting (by owner) ---")
    hrv.mint(user1, 5000000, owner_address)
    print(f"UserA Balance after mint: {hrv.get_balance(user1)}")
    print(f"New Total Supply: {hrv.get_total_supply()}")

    print("\n--- Minting (by non-owner) ---")
    hrv.mint(user2, 100000, user1)  # Should fail

    print("\n--- Burning ---")
    hrv.burn(user1, 1000000)
    print(f"UserA Balance after burn: {hrv.get_balance(user1)}")
    print(f"New Total Supply: {hrv.get_total_supply()}")