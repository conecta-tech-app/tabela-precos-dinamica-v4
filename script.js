// Função para formatar valores em moeda brasileira
function formatCurrency(value) {
	return new Intl.NumberFormat('pt-BR', {
		style: 'currency',
		currency: 'BRL',
		minimumFractionDigits: 2
	}).format(value);
}

// Objeto para armazenar os valores base e adicionais
const priceData = {
	standard: {
		base: 1250,
		cnpj_add: 50,
		sku_add: 150,
		user_add: 25,
		adesao: 13100,
		implantacao: 2500,
		integracao: 13680,
		cnpj_base: 1,
		sku_base: 10000,
		user_base: 2
	},
	full: {
		base: 2500,
		cnpj_add: 100,
		sku_add: 250,
		user_add: 50,
		adesao: 17320,
		implantacao: 5000,
		integracao: 16560,
		cnpj_base: 5,
		sku_base: 50000,
		user_base: 5
	},
	enterprise: {
		base: 3500,
		cnpj_add: 100,
		sku_add: 250,
		user_add: 0,
		adesao: 21920,
		implantacao: 10000,
		integracao: 16560,
		cnpj_base: 10,
		sku_base: 100000,
		user_base: Infinity
	}
};

// Função principal de cálculo
function calculateTotals() {
	// 1. Obter valores de entrada do usuário
	const totalCnpj = parseInt(document.getElementById('input-cnpj').value) || 0;
	const totalSku = parseInt(document.getElementById('input-sku').value) || 0;
	const totalUsers = parseInt(document.getElementById('input-users').value) || 0;

	// Iterar sobre cada plano
	['standard', 'full', 'enterprise'].forEach(plan => {
		const data = priceData[plan];

		// --- CÁLCULO DO SETUP ---
		const subTotalSetup = data.adesao + data.implantacao;
		let totalSetup = subTotalSetup;

		// Verifica o checkbox de Integração ERP
		const erpCheckbox = document.getElementById('erp-integration-checkbox');
		if (erpCheckbox && erpCheckbox.checked) {
			totalSetup += data.integracao;
		}

		// Atualizar valores do Setup na tabela
		document.getElementById(`subtotal-${plan}`).textContent = formatCurrency(subTotalSetup);
		document.getElementById(`total-setup-${plan}`).textContent = formatCurrency(totalSetup);

		// --- CÁLCULO DA MENSALIDADE ADICIONAL ---
		let monthlyTotal = data.base;
		let additionalCnpjCost = 0;
		let additionalSkuCost = 0;
		let additionalUserCost = 0;

		// CNPJ Adicional
		const cnpjDiff = totalCnpj - data.cnpj_base;
		if (cnpjDiff > 0) {
			additionalCnpjCost = cnpjDiff * data.cnpj_add;
			monthlyTotal += additionalCnpjCost;
		}

		// SKU Adicional (a cada 10.000)
		const skuDiff = totalSku - data.sku_base;
		if (skuDiff > 0) {
			const skuBlocks = Math.ceil(skuDiff / 10000);
			additionalSkuCost = skuBlocks * data.sku_add;
			monthlyTotal += additionalSkuCost;
		}

		// Usuário Adicional
		const userDiff = totalUsers - data.user_base;
		if (data.user_base !== Infinity && userDiff > 0) {
			additionalUserCost = userDiff * data.user_add;
			monthlyTotal += additionalUserCost;
		}

		// Atualizar custos adicionais na tabela
		document.getElementById(`add-cnpj-${plan}`).textContent = formatCurrency(additionalCnpjCost);
		document.getElementById(`add-sku-${plan}`).textContent = formatCurrency(additionalSkuCost);
		document.getElementById(`add-user-${plan}`).textContent = formatCurrency(additionalUserCost);

		// Atualizar total mensal
		document.getElementById(`total-monthly-${plan}`).textContent = formatCurrency(monthlyTotal);

		// --- CÁLCULO DO TOTAL ANUAL ---
		const totalAnnual = totalSetup + (monthlyTotal * 12);
		document.getElementById(`total-annual-${plan}`).textContent = formatCurrency(totalAnnual);

		// Armazenar valores para uso no ROI
		priceData[plan].totalSetup = totalSetup;
		priceData[plan].monthlyTotal = monthlyTotal;
		priceData[plan].totalAnnual = totalAnnual;
	});
}

// --- LÓGICA DE EDIÇÃO DE CAMPOS ---

function setupEditableFields() {
	const editableCells = document.querySelectorAll('.editable');

	editableCells.forEach(cell => {
		cell.addEventListener('click', function (event) {
			if (event.target.tagName === 'INPUT') return;

			const currentValue = this.getAttribute('data-value');
			const plan = this.getAttribute('data-plan');
			const type = this.getAttribute('data-type');

			// Criar campo de entrada
			const input = document.createElement('input');
			input.type = 'number';
			input.value = currentValue;
			input.step = '0.01';

			// Limpar célula e adicionar input
			this.textContent = '';
			this.appendChild(input);
			input.focus();
			input.select();

			// Função para salvar o valor
			const saveValue = () => {
				const newValue = parseFloat(input.value) || 0;
				this.setAttribute('data-value', newValue);
				this.textContent = formatCurrency(newValue);

				// Atualizar priceData
				if (priceData[plan] && priceData[plan][type] !== undefined) {
					priceData[plan][type] = newValue;
				}

				// Recalcular totais
				calculateTotals();
			};

			// Salvar ao pressionar Enter ou ao sair do campo
			input.addEventListener('blur', saveValue);
			input.addEventListener('keypress', (e) => {
				if (e.key === 'Enter') saveValue();
			});
		});
	});
}

// --- LÓGICA DE SELEÇÃO DE PLANO ---

function setupPlanSelector() {
	const buttons = document.querySelectorAll('.plan-selector-button');
	const table = document.getElementById('priceTable');
	const plans = ['standard', 'full', 'enterprise'];

	buttons.forEach(button => {
		button.addEventListener('click', function () {
			const selectedPlan = this.getAttribute('data-plan');

			// 1. Remove a seleção de todos os botões e colunas
			buttons.forEach(btn => btn.classList.remove('selected'));
			table.querySelectorAll('tr').forEach(row => {
				row.classList.remove('highlighted');
			});

			// 2. Adiciona a seleção ao botão clicado
			this.classList.add('selected');

			// 3. Adiciona o destaque à coluna correspondente
			const planIndex = plans.indexOf(selectedPlan) + 2;

			table.querySelectorAll('tr').forEach(row => {
				const cells = row.querySelectorAll('td, th');
				if (cells.length > planIndex - 1) {
					row.classList.add('highlighted');
				}
			});

			// 4. Salva o plano selecionado
			localStorage.setItem('selectedPlan', selectedPlan);
		});
	});

	// Tenta carregar o plano selecionado ao iniciar
	const initialPlan = localStorage.getItem('selectedPlan') || 'standard';
	const initialButton = document.querySelector(`.plan-selector-button[data-plan="${initialPlan}"]`);
	if (initialButton) {
		initialButton.click();
	} else {
		document.querySelector('.plan-selector-button[data-plan="standard"]').click();
	}
}

// --- LÓGICA DE INPUTS DA CALCULADORA ---

function setupCalculatorInputs() {
	// Vincula o evento de clique ao botão calcular
	document.getElementById('calculate-button').addEventListener('click', calculateTotals);

	// Vincula o evento de clique ao checkbox do ERP
	const erpCheckbox = document.getElementById('erp-integration-checkbox');
	if (erpCheckbox) {
		erpCheckbox.addEventListener('change', calculateTotals);
	}
}

// --- LÓGICA DE CÁLCULO DE ROI ---

function calculateROI() {
	const monthlyPurchases = parseFloat(document.getElementById('input-monthly-purchases').value) || 0;

	if (monthlyPurchases <= 0) {
		alert('Por favor, insira um valor válido para o Valor Médio Mensal de Compras/Vendas.');
		return;
	}

	// Percentuais de perda (baseado no slide)
	const excessPercentage = 0.27;     // 27%
	const rupturePercentage = 0.12;    // 12%
	const marginPercentage = 0.13;     // 13%
	const efficiencyPercentage = 0.20; // 20%

	// Iterar sobre cada plano
	['standard', 'full', 'enterprise'].forEach(plan => {
		// --- CÁLCULO DO CUSTO DE NÃO AGIR (ANUAL) ---
		const monthlyExcessCost = monthlyPurchases * excessPercentage;
		const monthlyRuptureCost = monthlyPurchases * rupturePercentage;
		const monthlyMarginCost = monthlyPurchases * marginPercentage;
		const monthlyEfficiencyCost = monthlyPurchases * efficiencyPercentage;

		const annualExcessCost = monthlyExcessCost * 12;
		const annualRuptureCost = monthlyRuptureCost * 12;
		const annualMarginCost = monthlyMarginCost * 12;
		const annualEfficiencyCost = monthlyEfficiencyCost * 12;

		const totalCostOfInaction = annualExcessCost + annualRuptureCost + annualMarginCost + annualEfficiencyCost;

		// --- ATUALIZAR TABELA ROI ---
		document.getElementById(`roi-excess-${plan}`).textContent = formatCurrency(annualExcessCost);
		document.getElementById(`roi-rupture-${plan}`).textContent = formatCurrency(annualRuptureCost);
		document.getElementById(`roi-margin-${plan}`).textContent = formatCurrency(annualMarginCost);
		document.getElementById(`roi-efficiency-${plan}`).textContent = formatCurrency(annualEfficiencyCost);
		document.getElementById(`roi-total-${plan}`).textContent = formatCurrency(totalCostOfInaction);

		// --- INVESTIMENTO KENIT (ANUAL) ---
		const setupCost = priceData[plan].totalSetup || 0;
		const monthlyCost = priceData[plan].monthlyTotal || 0;
		const annualMonthlyCost = monthlyCost * 12;
		const totalKenitInvestment = setupCost + annualMonthlyCost;

		document.getElementById(`roi-setup-${plan}`).textContent = formatCurrency(setupCost);
		document.getElementById(`roi-monthly-${plan}`).textContent = formatCurrency(annualMonthlyCost);
		document.getElementById(`roi-kenit-${plan}`).textContent = formatCurrency(totalKenitInvestment);

		// --- COMPARAÇÃO E ROI ---
		const savings = totalCostOfInaction - totalKenitInvestment;
		const roiPercentage = (savings / totalKenitInvestment) * 100;

		document.getElementById(`roi-savings-${plan}`).textContent = formatCurrency(savings);
		document.getElementById(`roi-percentage-${plan}`).textContent = roiPercentage.toFixed(2) + '%';
	});

	// --- MENSAGEM DE CONCLUSÃO ---
	const selectedPlan = localStorage.getItem('selectedPlan') || 'standard';
	const setupCost = priceData[selectedPlan].totalSetup || 0;
	const monthlyCost = priceData[selectedPlan].monthlyTotal || 0;
	const annualMonthlyCost = monthlyCost * 12;
	const totalKenitInvestment = setupCost + annualMonthlyCost;

	const monthlyTotalCostOfInaction = monthlyPurchases * (excessPercentage + rupturePercentage + marginPercentage + efficiencyPercentage);
	const annualTotalCostOfInaction = monthlyTotalCostOfInaction * 12;

	const savings = annualTotalCostOfInaction - totalKenitInvestment;

	const messageElement = document.getElementById('roi-message');
	if (savings > 0) {
		messageElement.className = 'roi-message positive';
		messageElement.textContent = `O investimento no Kenit é inferior ao custo de não agir. Economia anual estimada: ${formatCurrency(savings)}. O ROI é imediato!`;
	} else {
		messageElement.className = 'roi-message negative';
		messageElement.textContent = `O custo de não agir é menor que o investimento no Kenit para este cenário. Considere revisar os dados.`;
	}
}

// --- INICIALIZAÇÃO ---

document.addEventListener('DOMContentLoaded', () => {
	// 1. Configurar campos editáveis
	setupEditableFields();

	// 2. Configurar inputs da calculadora e checkbox do ERP
	setupCalculatorInputs();

	// 3. Configurar a seleção de plano
	setupPlanSelector();

	// 4. Configurar o botão de ROI
	document.getElementById('calculate-roi-button').addEventListener('click', calculateROI);

	// 5. Calcular totais iniciais
	calculateTotals();
});
