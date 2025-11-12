// --- CONSTANTES E DADOS ---

// Valores do Plano Único (Baseado na imagem original e nas novas regras)
const BASE_PLAN = {
    base_monthly: 1300,
    base_cnpj: 1,
    base_sku: 10000,
    base_users: 2,
    setup_cost: 2500, // Implantação (R$ 2.500,00) + Taxa de Adesão (R$ 13.100,00) - Simplificado para R$ 2.500,00 conforme o setup da imagem original (Sub-Total)
    // Usando 2500 como custo de setup para simplificar, já que o usuário não mencionou os valores de adesão e implantação
    // Vou usar o valor de R$ 2.500,00 como custo de Setup, que é o valor da Implantação do plano Standard na imagem original.
    // O valor de R$ 13.100,00 (Adesão) + R$ 2.500,00 (Implantação) = R$ 15.600,00 (Sub-Total)
    // Para simplificar, vou usar R$ 15.600,00 como Setup Fixo.
    setup_cost: 15600,

    // Valores Adicionais
    add_user: 50,
    add_cnpj: 100,
    add_sku: 250 // por 10.000 SKUs
};

// --- FUNÇÕES DE UTILIDADE ---

function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2
    }).format(value);
}

// --- LÓGICA DE CÁLCULO DO PLANO ---

function calculatePlanCost() {
    // 1. Obter valores de entrada do usuário
    const totalCnpj = parseInt(document.getElementById('input-cnpj').value) || 0;
    const totalSku = parseInt(document.getElementById('input-sku').value) || 0;
    const totalUsers = parseInt(document.getElementById('input-users').value) || 0;

    let monthlyCost = BASE_PLAN.base_monthly;
    let additionalCost = 0;

    // CNPJ Adicional
    const cnpjDiff = totalCnpj - BASE_PLAN.base_cnpj;
    if (cnpjDiff > 0) {
        additionalCost += cnpjDiff * BASE_PLAN.add_cnpj;
    }

    // SKU Adicional (a cada 10.000)
    const skuDiff = totalSku - BASE_PLAN.base_sku;
    if (skuDiff > 0) {
        const skuBlocks = Math.ceil(skuDiff / 10000);
        additionalCost += skuBlocks * BASE_PLAN.add_sku;
    }

    // Usuário Adicional
    const userDiff = totalUsers - BASE_PLAN.base_users;
    if (userDiff > 0) {
        additionalCost += userDiff * BASE_PLAN.add_user;
    }

    monthlyCost += additionalCost;
    const totalSetup = BASE_PLAN.setup_cost;
    const totalAnnual = totalSetup + (monthlyCost * 12);

    // 2. Atualizar resultados na tela
    document.getElementById('total-monthly-cost').textContent = formatCurrency(monthlyCost);
    document.getElementById('total-setup-cost').textContent = formatCurrency(totalSetup);
    document.getElementById('total-annual-cost').textContent = formatCurrency(totalAnnual);

    // Retorna os custos para o cálculo do ROI
    return { monthlyCost, totalSetup, totalAnnual };
}

// --- LÓGICA DE CÁLCULO DO ROI ---

function calculateROI() {
    const stockValueInput = document.getElementById('input-stock-value');
    const isTotalStockCheckbox = document.getElementById('is-total-stock-checkbox');
    const stockValue = parseFloat(stockValueInput.value) || 0;

    if (stockValue <= 0) {
        alert('Por favor, insira um valor válido para o Estoque.');
        return;
    }

    let excessStockValue = 0;
    const marketExcessPercentage = 0.60; // 60% de excesso na média de mercado

    if (isTotalStockCheckbox.checked) {
        // Opção 2: Calcular excesso com base no estoque total (60% de excesso)
        excessStockValue = stockValue * marketExcessPercentage;
    } else {
        // Opção 1: O valor inserido é o próprio excesso de estoque
        excessStockValue = stockValue;
    }

    // 1. Calcular a economia potencial (20% e 30% de redução do excesso)
    const reduction20 = excessStockValue * 0.20;
    const reduction30 = excessStockValue * 0.30;

    // 2. Obter o custo anual do Kenit
    const { totalAnnual } = calculatePlanCost();

    // 3. Calcular o ROI (usando a média de redução de 25% para o ROI final)
    const averageReduction = excessStockValue * 0.25;
    const savings = averageReduction - totalAnnual;
    const roiPercentage = (savings / totalAnnual) * 100;

    // 4. Atualizar resultados na tela
    document.getElementById('excess-stock-value').textContent = formatCurrency(excessStockValue);
    document.getElementById('reduction-20-value').textContent = formatCurrency(reduction20);
    document.getElementById('reduction-30-value').textContent = formatCurrency(reduction30);
    document.getElementById('roi-final-percentage').textContent = roiPercentage.toFixed(2) + '%';
    document.getElementById('roi-final-percentage').style.color = savings >= 0 ? '#28a745' : '#dc3545';

    // 5. Atualizar a barra de comparação
    const totalValue = averageReduction + totalAnnual;
    const savingsPercentage = (averageReduction / totalValue) * 100;
    const costPercentage = (totalAnnual / totalValue) * 100;

    const savingsBar = document.getElementById('savings-bar');
    const costBar = document.getElementById('cost-bar');
    const savingsLabel = document.getElementById('savings-bar-label');
    const costLabel = document.getElementById('cost-bar-label');

    // Se a economia for maior que o custo, a barra de economia ocupa a maior parte
    if (averageReduction >= totalAnnual) {
        savingsBar.style.width = `${savingsPercentage}%`;
        costBar.style.width = `${costPercentage}%`;
        savingsLabel.textContent = `Economia: ${formatCurrency(averageReduction)}`;
        costLabel.textContent = `Custo Kenit: ${formatCurrency(totalAnnual)}`;
    } else {
        // Se o custo for maior que a economia, inverte a ordem visualmente (opcional) ou apenas ajusta as larguras
        savingsBar.style.width = `${savingsPercentage}%`;
        costBar.style.width = `${costPercentage}%`;
        savingsLabel.textContent = `Economia: ${formatCurrency(averageReduction)}`;
        costLabel.textContent = `Custo Kenit: ${formatCurrency(totalAnnual)}`;
    }

    // Ajuste visual para casos extremos
    if (savingsPercentage < 10) savingsLabel.textContent = '';
    if (costPercentage < 10) costLabel.textContent = '';
}

// --- INICIALIZAÇÃO ---

document.addEventListener('DOMContentLoaded', () => {
    // 1. Configurar eventos de input para o cálculo do plano
    document.getElementById('input-cnpj').addEventListener('input', calculatePlanCost);
    document.getElementById('input-sku').addEventListener('input', calculatePlanCost);
    document.getElementById('input-users').addEventListener('input', calculatePlanCost);

    // 2. Configurar eventos de input e checkbox para o cálculo do ROI
    document.getElementById('input-stock-value').addEventListener('input', calculateROI);
    document.getElementById('is-total-stock-checkbox').addEventListener('change', calculateROI);

    // 3. Calcular custos iniciais
    calculatePlanCost();
    calculateROI(); // Tenta calcular o ROI inicial (será 0 ou pedirá input)
});
