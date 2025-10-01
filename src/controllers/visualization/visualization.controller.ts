import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiSecurity } from '@nestjs/swagger';
import { JwtGuard, ApiKeyGuard } from '@auth';

@ApiTags('Visualization')
@Controller('visualization')
@UseGuards(JwtGuard, ApiKeyGuard)
@ApiBearerAuth()
@ApiSecurity('api-key')
export class VisualizationController {
  @Get()
  @ApiOperation({ 
    summary: 'Get real-time product changes visualization page',
    description: 'Returns an HTML page with real-time visualization of product price changes. Requires JWT authentication and API key.'
  })
  @ApiResponse({ status: 200, description: 'HTML page served successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing JWT token or API key' })
  async getVisualizationPage(@Res() res: Response): Promise<void> {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Product Aggregator - Real-time Changes</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        h1 {
            color: #333;
            text-align: center;
            margin-bottom: 30px;
        }
        .status {
            padding: 10px;
            margin-bottom: 20px;
            border-radius: 4px;
            font-weight: bold;
        }
        .status.connected {
            background-color: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        .status.disconnected {
            background-color: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
        .changes-container {
            max-height: 600px;
            overflow-y: auto;
            border: 1px solid #ddd;
            border-radius: 4px;
        }
        .change-item {
            padding: 15px;
            border-bottom: 1px solid #eee;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .change-item:last-child {
            border-bottom: none;
        }
        .change-item:hover {
            background-color: #f8f9fa;
        }
        .product-info {
            flex: 1;
        }
        .product-name {
            font-weight: bold;
            color: #333;
            margin-bottom: 5px;
        }
        .provider-name {
            color: #666;
            font-size: 0.9em;
        }
        .price-info {
            text-align: right;
        }
        .old-price {
            text-decoration: line-through;
            color: #999;
            font-size: 0.9em;
        }
        .new-price {
            font-weight: bold;
            font-size: 1.1em;
        }
        .price-increase {
            color: #dc3545;
        }
        .price-decrease {
            color: #28a745;
        }
        .change-percentage {
            font-size: 0.9em;
            margin-top: 5px;
        }
        .timestamp {
            color: #666;
            font-size: 0.8em;
            margin-top: 5px;
        }
        .no-changes {
            text-align: center;
            color: #666;
            padding: 40px;
            font-style: italic;
        }
        .stats {
            display: flex;
            justify-content: space-around;
            margin-bottom: 20px;
            padding: 15px;
            background-color: #f8f9fa;
            border-radius: 4px;
        }
        .stat-item {
            text-align: center;
        }
        .stat-value {
            font-size: 1.5em;
            font-weight: bold;
            color: #333;
        }
        .stat-label {
            color: #666;
            font-size: 0.9em;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Product Aggregator - Real-time Changes</h1>
        
        <div id="status" class="status disconnected">
            Connecting to real-time updates...
        </div>
        
        <div class="stats">
            <div class="stat-item">
                <div class="stat-value" id="total-changes">0</div>
                <div class="stat-label">Total Changes</div>
            </div>
            <div class="stat-item">
                <div class="stat-value" id="price-increases">0</div>
                <div class="stat-label">Price Increases</div>
            </div>
            <div class="stat-item">
                <div class="stat-value" id="price-decreases">0</div>
                <div class="stat-label">Price Decreases</div>
            </div>
            <div class="stat-item">
                <div class="stat-value" id="last-update">-</div>
                <div class="stat-label">Last Update</div>
            </div>
        </div>
        
        <div class="changes-container" id="changes-container">
            <div class="no-changes">No changes yet. Waiting for real-time updates...</div>
        </div>
    </div>

    <script>
        let eventSource;
        let totalChanges = 0;
        let priceIncreases = 0;
        let priceDecreases = 0;
        
        function connect() {
            const apiKey = prompt('Enter API Key:') || 'default-api-key-123';
            const token = prompt('Enter JWT Token:') || '';
            
            if (!token) {
                alert('JWT Token is required for authentication');
                return;
            }
            
            const url = '/api/products/changes/stream';
            
            fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + token,
                    'X-API-Key': apiKey,
                    'Accept': 'text/event-stream',
                    'Cache-Control': 'no-cache'
                }
            }).then(response => {
                if (!response.ok) {
                    throw new Error('Failed to connect: ' + response.status + ' ' + response.statusText);
                }
                
                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                
                function readStream() {
                    reader.read().then(({ done, value }) => {
                        if (done) {
                            console.log('Stream ended');
                            return;
                        }
                        
                        const chunk = decoder.decode(value, { stream: true });
                        const lines = chunk.split('\\n');
                        
                        for (const line of lines) {
                            if (line.startsWith('data: ')) {
                                const data = line.slice(6);
                                if (data.trim() === '') continue;
                                
                                try {
                                    const parsedData = JSON.parse(data);
                                    handleMessage(parsedData);
                                } catch (error) {
                                    console.error('Error parsing SSE data:', error);
                                }
                            }
                        }
                        
                        readStream();
                    }).catch(error => {
                        console.error('Error reading stream:', error);
                        document.getElementById('status').className = 'status disconnected';
                        document.getElementById('status').textContent = 'Connection lost. Retrying...';
                        
                        setTimeout(() => {
                            connect();
                        }, 5000);
                    });
                }
                
                readStream();
                
                document.getElementById('status').className = 'status connected';
                document.getElementById('status').textContent = 'Connected to real-time updates';
                
            }).catch(error => {
                console.error('Connection error:', error);
                document.getElementById('status').className = 'status disconnected';
                document.getElementById('status').textContent = 'Failed to connect: ' + error.message;
                
                setTimeout(() => {
                    connect();
                }, 5000);
            });
        }
        
        function handleMessage(data) {
            switch (data.type) {
                case 'connected':
                    console.log('Connected to SSE stream');
                    break;
                    
                case 'price_change':
                    addPriceChange(data.data);
                    break;
                    
                case 'heartbeat':
                    updateLastUpdate(data.timestamp);
                    break;
                    
                case 'error':
                    console.error('SSE Error:', data.message);
                    break;
            }
        }
        
        function addPriceChange(change) {
            totalChanges++;
            if (change.changePercentage > 0) {
                priceIncreases++;
            } else if (change.changePercentage < 0) {
                priceDecreases++;
            }
            
            updateStats();
            
            const container = document.getElementById('changes-container');
            const noChangesDiv = container.querySelector('.no-changes');
            if (noChangesDiv) {
                noChangesDiv.remove();
            }
            
            const changeItem = document.createElement('div');
            changeItem.className = 'change-item';
            
            const priceClass = change.changePercentage > 0 ? 'price-increase' : 'price-decrease';
            const changeSymbol = change.changePercentage > 0 ? '+' : '';
            
            changeItem.innerHTML = \`
                <div class="product-info">
                    <div class="product-name">\${change.productName}</div>
                    <div class="provider-name">Provider: \${change.providerName}</div>
                    <div class="timestamp">\${new Date(change.timestamp).toLocaleString()}</div>
                </div>
                <div class="price-info">
                    <div class="old-price">\${change.currency} \${change.oldPrice.toFixed(2)}</div>
                    <div class="new-price \${priceClass}">\${change.currency} \${change.newPrice.toFixed(2)}</div>
                    <div class="change-percentage \${priceClass}">\${changeSymbol}\${change.changePercentage.toFixed(2)}%</div>
                </div>
            \`;
            
            container.insertBefore(changeItem, container.firstChild);
            
            const changes = container.querySelectorAll('.change-item');
            if (changes.length > 50) {
                changes[changes.length - 1].remove();
            }
        }
        
        function updateStats() {
            document.getElementById('total-changes').textContent = totalChanges;
            document.getElementById('price-increases').textContent = priceIncreases;
            document.getElementById('price-decreases').textContent = priceDecreases;
        }
        
        function updateLastUpdate(timestamp) {
            document.getElementById('last-update').textContent = new Date(timestamp).toLocaleTimeString();
        }
        
        connect();
        
        window.addEventListener('beforeunload', function() {
        });
    </script>
</body>
</html>
    `;

    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  }
}
