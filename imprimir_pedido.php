<?php
session_start();
require_once 'inc/auth.php';
require_login();

// Verificar se o ID do pedido foi informado
if (!isset($_GET['id']) || empty($_GET['id'])) {
    header('Location: pedidos.php?error=' . urlencode('ID do pedido não informado'));
    exit;
}

$order_id = (int)$_GET['id'];

// Buscar dados do pedido
$stmt = $conn->prepare('
    SELECT o.*, 
           c.name as customer_name, 
           c.phone as customer_phone, 
           c.address as customer_address,
           u_estab.name as establishment_user_name,
           e.restaurant_name,
           u_estab.phone as establishment_phone,
           e.business_hours,
           e.delivery_radius,
           e.pix_key,
           e.logo_url,
           e.banner_url,
           u_estab.address as establishment_address
    FROM orders o 
    JOIN users c ON o.customer_id = c.id 
    JOIN users u_estab ON o.establishment_id = u_estab.id
    LEFT JOIN establishment_profile e ON u_estab.id = e.user_id
    WHERE o.id = ?
');

if (!$stmt) {
    die('Erro ao preparar consulta: ' . $conn->error);
}

$stmt->bind_param('i', $order_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    header('Location: pedidos.php?error=' . urlencode('Pedido não encontrado'));
    exit;
}

$order = $result->fetch_assoc();

// Verificar permissão
if ($_SESSION['user']['role'] === 'ESTABLISHMENT' && $_SESSION['user']['id'] !== $order['establishment_id']) {
    header('Location: pedidos.php?error=' . urlencode('Você não tem permissão para acessar este pedido'));
    exit;
}

// Buscar itens do pedido com seus acréscimos
$stmt = $conn->prepare('
    SELECT oi.*, p.name as product_name, p.description as product_description
    FROM order_items oi 
    JOIN products p ON oi.product_id = p.id 
    WHERE oi.order_id = ?
');
$stmt->bind_param('i', $order_id);
$stmt->execute();
$order_items = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

// Buscar acréscimos para cada item
foreach ($order_items as &$item) {
    $stmt = $conn->prepare('
        SELECT oia.*, o.name as acrescimo_name, o.additional_price as acrescimo_price
        FROM order_item_acrescimo oia
        JOIN options o ON oia.acrescimo_id = o.id
        WHERE oia.order_item_id = ?
    ');
    $stmt->bind_param('i', $item['id']);
    $stmt->execute();
    $item['acrescimos'] = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
}

// Tradução de status
$status_labels = [
    'PENDING' => 'Pendente',
    'PREPARING' => 'Preparando',
    'READY' => 'Pronto',
    'DELIVERING' => 'Em Entrega',
    'DELIVERED' => 'Entregue',
    'CANCELLED' => 'Cancelado'
];

// Tradução de métodos de pagamento
$payment_methods = [
    'CASH' => 'Dinheiro',
    'CREDIT' => 'Cartão de Crédito',
    'DEBIT' => 'Cartão de Débito',
    'PIX' => 'PIX'
];
?>

<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>Pedido #<?php echo $order_id; ?></title>
    <style>
        @page {
            size: 58mm auto;
            margin: 0;
        }
        
        @media print {
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            .no-print {
                display: none !important;
            }
            
            body {
                width: 58mm;
                min-width: 58mm;
                max-width: 58mm;
                margin: 0;
                padding: 2mm;
                font-family: monospace;
                font-size: 12pt;
                line-height: 1;
                letter-spacing: -0.5px;
                background: white;
                word-wrap: break-word;
                white-space: normal;
            }
            
            .container {
                width: 100%;
                min-width: 54mm;
                max-width: 58mm;
                word-wrap: break-word;
                white-space: normal;
            }
            
            .divider {
                margin: 1mm 0;
            }
            
            .text-center {
                text-align: center;
            }
            
            .text-right {
                text-align: right;
            }
            
            .bold {
                font-weight: bold;
            }
            
            .establishment-name {
                font-weight: bold;
                font-size: 14pt;
                text-align: center;
                margin-bottom: 2mm;
                letter-spacing: -0.5px;
            }
            
            .order-number {
                font-weight: bold;
                font-size: 16pt;
                text-align: center;
                margin: 2mm 0;
                letter-spacing: -0.5px;
            }
            
            .section {
                margin: 10px 0 10px 0;
            }
            
            .item, .detail-value, .order-items {
                word-wrap: break-word;
                white-space: normal;
                overflow-wrap: break-word;
                letter-spacing: -0.5px;
                margin: 0;
                padding: 0;
            }
            
            .item {
                margin: 6px 0 8px 0;
                padding: 0;
            }
            
            .item-name {
                font-weight: bold;
            }
            
            .acrescimo {
                padding-left: 3mm;
                font-style: italic;
            }
            
            .acrescimo-quantity {
                font-weight: bold;
            }
            
            .acrescimo-price {
                float: right;
            }
            
            .subtotal {
                text-align: right;
                margin-top: 1mm;
                border-top: 1px dotted #000;
                padding-top: 1mm;
            }
            
            .total {
                font-weight: bold;
                font-size: 13pt;
                margin-top: 2mm;
                letter-spacing: -0.5px;
            }
            
            .footer {
                text-align: center;
                font-size: 10pt;
                margin-top: 4mm;
                letter-spacing: -0.5px;
            }
        }
        
        /* Estilos para visualização na tela */
        body {
            font-family: monospace;
            padding: 10px;
            max-width: 55mm;
            margin: 0 auto;
            background: #f0f0f0;
        }
        
        .container {
            background: white;
            padding: 2mm;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        
        .preview-message {
            text-align: center;
            padding: 10px;
            background: #fff3cd;
            margin-bottom: 10px;
            border-radius: 4px;
        }
        
        .btn-print {
            display: block;
            width: 100%;
            padding: 10px;
            background: #007bff;
            color: white;
            text-align: center;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            margin: 10px 0;
            text-decoration: none;
        }
        
        .btn-back {
            display: block;
            width: 100%;
            padding: 10px;
            background: #6c757d;
            color: white;
            text-align: center;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="preview-message no-print">
        Visualização da Comanda - 55mm
    </div>
    
    <div class="container">
        <div class="establishment-name">
            <?php echo mb_strtoupper(htmlspecialchars($order['restaurant_name'] ?: $order['establishment_user_name'])); ?>
        </div>
        
        <div class="text-center">
            <?php echo htmlspecialchars($order['establishment_phone']); ?><br>
            <?php echo htmlspecialchars($order['establishment_address']); ?>
        </div>
        
        <div class="divider"></div>
        
        <div class="order-number">
            PEDIDO #<?php echo $order_id; ?>
        </div>
        
        <div class="text-center">
            <?php echo date('d/m/Y H:i', strtotime($order['created_at'])); ?>
        </div>
        
        <div class="divider"></div>
        
        <div class="section">
            CLIENTE: <?php echo htmlspecialchars($order['customer_name']); ?><br>
            TEL: <?php echo htmlspecialchars($order['customer_phone']); ?><br>
            END: <?php echo htmlspecialchars($order['customer_address']); ?>
        </div>
        
        <div class="divider"></div>
        
        <div class="section">
            <?php foreach ($order_items as $item): ?>
                <div class="item">
                    <div class="item-name">
                        <?php echo $item['quantity'] . 'x ' . $item['product_name']; ?>
                        <span class="text-right">
                            R$ <?php echo number_format($item['price'] * $item['quantity'], 2, ',', '.'); ?>
                        </span>
                    </div>
                    <?php if (!empty($item['obs'])): ?>
                        <div style="color:#007bff;font-style:italic;font-size:7.5pt;">Obs: <?php echo htmlspecialchars($item['obs']); ?></div>
                    <?php endif; ?>
                    
                    <?php if (!empty($item['acrescimos'])): ?>
                        <?php foreach ($item['acrescimos'] as $acrescimo): ?>
                            <div class="acrescimo">
                                <span class="acrescimo-quantity">
                                    <?php echo $acrescimo['quantity'] . 'x'; ?>
                                </span>
                                <?php echo $acrescimo['acrescimo_name']; ?>
                                <span class="acrescimo-price">
                                    R$ <?php echo number_format($acrescimo['acrescimo_price'] * $acrescimo['quantity'], 2, ',', '.'); ?>
                                </span>
                            </div>
                        <?php endforeach; ?>
                        
                        <div class="subtotal">
                            Subtotal: R$ <?php 
                                $subtotal = $item['price'] * $item['quantity'];
                                foreach ($item['acrescimos'] as $acrescimo) {
                                    $subtotal += $acrescimo['acrescimo_price'] * $acrescimo['quantity'];
                                }
                                echo number_format($subtotal, 2, ',', '.');
                            ?>
                        </div>
                    <?php endif; ?>
                </div>
            <?php endforeach; ?>
        </div>
        
        <div class="divider"></div>
        
        <div class="section">
            <div class="text-right">
                Subtotal: R$ <?php echo number_format($order['total_amount'], 2, ',', '.'); ?><br>
                Taxa de entrega: R$ <?php echo number_format($order['delivery_fee'], 2, ',', '.'); ?><br>
                <div class="total">
                    Total: R$ <?php echo number_format($order['total_amount'], 2, ',', '.'); ?>
                </div>
            </div>
        </div>
        
        <div class="divider"></div>
        
        <div class="section">
            Pagamento: <?php echo $payment_methods[$order['payment_method']] ?? $order['payment_method']; ?><br>
            
            <?php if ($order['payment_method'] === 'CASH' && isset($order['amount_paid']) && $order['amount_paid'] !== null): ?>
                Valor Pago: R$ <?php echo number_format($order['amount_paid'], 2, ',', '.'); ?><br>
                Troco: R$ <?php echo number_format($order['change_amount'] ?? 0, 2, ',', '.'); ?><br>
            <?php endif; ?>

            Status: <?php echo $status_labels[$order['status']] ?? $order['status']; ?><br>
            Pagamento: <?php echo $order['payment_status'] === 'PAID' ? 'Pago' : 'Pendente'; ?>
        </div>
        
        <div class="divider"></div>
        
        <div class="footer">
            Pedido gerado em <?php echo date('d/m/Y H:i:s'); ?><br>
            www.foodflight.com.br
        </div>
    </div>
    
    <div class="no-print">
        <button onclick="window.print();" class="btn-print">Imprimir Comanda</button>
        <a href="pedidos.php" class="btn-back">Voltar para Lista de Pedidos</a>
    </div>
</body>
</html> 