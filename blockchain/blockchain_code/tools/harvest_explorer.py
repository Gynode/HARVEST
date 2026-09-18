from flask import Flask, render_template_string

app = Flask(__name__)

# Placeholder for blockchain data
blockchain_data = {
    "latest_block": {"height": 100, "hash": "0xabc...", "transactions": 5},
    "total_transactions": 10000,
    "node_handlers": ["Master1", "Master2", "Master3"]
}

@app.route('/')
def index():
    return render_template_string('''
        <!DOCTYPE html>
        <html>
        <head>
            <title>HARVEST Blockchain Explorer</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .container { max-width: 800px; margin: auto; background: #f4f4f4; padding: 20px; border-radius: 8px; }
                h1, h2 { color: #333; }
                .data-item { margin-bottom: 10px; }
                .data-item strong { display: inline-block; width: 200px; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>HARVEST Blockchain Explorer</h1>
                <div class="data-item">
                    <strong>Latest Block Height:</strong> {{ blockchain_data.latest_block.height }}
                </div>
                <div class="data-item">
                    <strong>Block Hash:</strong> {{ blockchain_data.latest_block.hash }}
                </div>
                <div class="data-item">
                    <strong>Transactions in Block:</strong> {{ blockchain_data.latest_block.transactions }}
                </div>
                <div class="data-item">
                    <strong>Total Transactions:</strong> {{ blockchain_data.total_transactions }}
                </div>
                <div class="data-item">
                    <strong>Node Handlers:</strong> {{ blockchain_data.node_handlers|join(', ') }}
                </div>
            </div>
        </body>
        </html>
    ''', blockchain_data=blockchain_data)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
