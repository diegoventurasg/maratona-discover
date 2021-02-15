const Modal = {
    open(index){
        if(index!==-1){
            const item = Transaction.get(index)
            document.querySelector('input#index').value = index
            document.querySelector('input#description').value = item.description
            document.querySelector('input#amount').value = Utils.formatCurrencyEdit(item.amount)
            document.querySelector('input#date').value = Utils.formatDateEdit(item.date)
        }

        // Abrir modal
        // Adicionar a class active ao modal
        document
            .querySelector('.modal-overlay')
            .classList
            .add('active')            
    },
    
    close(){
        // Fechar modal
        // Remover a class active do modal
        document
            .querySelector('.modal-overlay')
            .classList
            .remove('active')
        
        Form.clearFields()
    }
}

const Storage = {
    get() {
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
    },

    set(transactions) {
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions))
    }
}

const Transaction = {
    all: Storage.get(),

    get(index) {
        try {
            return Transaction.all[index]
        } catch (error) {
            
        }
        return null
    },

    add(transaction) {
        Transaction.all.push(transaction)
        App.reload()
    },

    remove(index) {
        Transaction.all.splice(index, 1)
        App.reload()
    },

    update(index, transaction) {
        Transaction.all.splice(index, 1, transaction)
        App.reload()
    },

    incomes() {
        let income = Transaction.all
            .reduce((total, item)=> total + (item.amount > 0 ? item.amount : 0), 0)

        return income
    },

    expenses() {
        let expense = Transaction.all
            .reduce((total, item)=> total + (item.amount > 0 ? 0 : item.amount), 0)

        return expense
    },

    total() {
        return Transaction.incomes() + Transaction.expenses()
    }
}

const DOM = {
    transactionContainer: document.querySelector('#data-table tbody'),

    addTransaction(transaction, index) {
        const tr = document.createElement('tr');
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
        tr.dataset.index = index

        DOM.transactionContainer.appendChild(tr)
    },

    innerHTMLTransaction(transaction, index) {
        const CSSclass = transaction.amount > 0 ? "income" : "expense"

        const amount = Utils.formatCurrency(transaction.amount)

        const html = `
        <td class="description clickable" onclick="Modal.open(${index})">${transaction.description}</td>
        <td class="${CSSclass} clickable" onclick="Modal.open(${index})">${amount}</td>
        <td class="date clickable" onclick="Modal.open(${index})">${transaction.date}</td>
        <td>
            <img class="clickable" onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover transação">
        </td>
        `

        return html
    },

    updateBalance() {
        document
            .getElementById('incomeDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.incomes())
        document
            .getElementById('expenseDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.expenses())
        document
            .getElementById('totalDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.total())
    },

    clearTransactions() {
        DOM.transactionContainer.innerHTML = ""
    }
}

const Utils = {
    formatAmount(value) {
        value = value * 100

        return Math.round(value)
    },

    formatDate(date) {
        const splittedDate = date.split("-")

        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },

    formatDateEdit(date) {
        const splittedDate = date.split("/")

        return `${splittedDate[2]}-${splittedDate[1]}-${splittedDate[0]}`
    },

    formatCurrency(value) {
        const signal = Number(value) < 0 ? "-" : ""

        value = String(value).replace(/\D/g, "")

        value = Number(value) / 100

        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        })

        return signal + value
    },

    formatCurrencyEdit(value) {
        const signal = Number(value) < 0 ? "-" : ""

        value = String(value).replace(/\D/g, "")

        value = (Number(value) / 100).toFixed(2)

        return signal + value
    }
}

const Form = {
    index: document.querySelector('input#index'),
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    getIndex() {
        const i = Number(Form.index.value)
        return i
    },

    getValues() {
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value 
        }
    },

    validateFields() {
        const {description, amount, date} = Form.getValues()

        if(description.trim() === "" || amount.trim() === "" || date.trim() === "" ) {
            throw new Error("Por favor, preencha todos os campos")
        }
    },

    formatValues() {
        let {description, amount, date} = Form.getValues()

        amount = Utils.formatAmount(amount)
        date = Utils.formatDate(date)

        return {
            description,
            amount,
            date
        }

    },

    clearFields() {
        Form.index.value = "-1"
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },

    submit(event) {
        event.preventDefault()

        try {
            Form.validateFields()
            const transaction = Form.formatValues()
            const index = Form.getIndex()
            index !== -1 ? Transaction.update(index, transaction) : Transaction.add(transaction) 
            Form.clearFields()
            Modal.close()
        } catch (error) {
            alert(error)
        }
    }
}

const App = {
    init() {
        Transaction.all.forEach(DOM.addTransaction)
        
        DOM.updateBalance()

        Storage.set(Transaction.all)
    },
    reload() {
        DOM.clearTransactions()
        App.init()
    }
}

App.init()