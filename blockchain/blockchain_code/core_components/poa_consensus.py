import logging
from datetime import datetime

# Set up logging
logging.basicConfig(level=logging.INFO)

class PoAConsensus:
    def __init__(self, node_handlers):
        if not node_handlers:
            raise ValueError("Node handlers list cannot be empty.")
        self.node_handlers = node_handlers
        self.current_leader_index = 0

    def select_leader(self, block_height):
        # Simple round-robin leader selection
        self.current_leader_index = block_height % len(self.node_handlers)
        return self.node_handlers[self.current_leader_index]

    def create_block(self, transactions, leader_private_key):
        if not transactions:
            raise ValueError("Transaction list cannot be empty.")
        
        # Dynamically set block height and timestamp
        block_height = len(transactions)  # Example logic for height
        timestamp = datetime.utcnow().timestamp()  # Current UTC timestamp

        logging.info(f"Leader {self.node_handlers[self.current_leader_index]} creating block with {len(transactions)} transactions.")
        
        block = {
            "height": block_height,
            "timestamp": timestamp,
            "transactions": transactions,
            "leader": self.node_handlers[self.current_leader_index],
            "signature": "signed_by_leader"  # Placeholder for actual signing logic
        }
        return block

    def validate_block(self, block):
        logging.info(f"Validating block from leader {block['leader']}.")
        # Placeholder for actual validation logic
        return True  # Assume valid for now

    def add_node_handler(self, new_node_handler):
        self.node_handlers.append(new_node_handler)
        logging.info(f"Added new node handler: {new_node_handler}")

    def remove_node_handler(self, node_handler_to_remove):
        if node_handler_to_remove in self.node_handlers:
            self.node_handlers.remove(node_handler_to_remove)
            logging.info(f"Removed node handler: {node_handler_to_remove}")
        else:
            logging.warning(f"Node handler {node_handler_to_remove} not found.")

# Example Usage (for testing purposes)
if __name__ == "__main__":
    initial_node_handlers = ["Master1", "Master2", "Master3"]
    poa = PoAConsensus(initial_node_handlers)

    logging.info("\n--- Block Production Simulation ---")
    for i in range(5):
        leader = poa.select_leader(i)
        logging.info(f"Block Height: {i}, Selected Leader: {leader}")
        transactions = [f"tx{i}_1", f"tx{i}_2"]
        block = poa.create_block(transactions, "dummy_key")
        if poa.validate_block(block):
            logging.info(f"Block {i} validated successfully.\n")

    logging.info("\n--- Node Handler Management ---")
    poa.add_node_handler("Master4")
    poa.remove_node_handler("Master2")
    poa.remove_node_handler("Master5")  # Non-existent

    logging.info("\n--- Updated Node Handlers ---")
    logging.info(poa.node_handlers)

    logging.info("\n--- Block Production After Changes ---")
    for i in range(5, 8):
        leader = poa.select_leader(i)
        logging.info(f"Block Height: {i}, Selected Leader: {leader}")
        transactions = [f"tx{i}_1", f"tx{i}_2"]
        block = poa.create_block(transactions, "dummy_key")
        if poa.validate_block(block):
            logging.info(f"Block {i} validated successfully.\n")


