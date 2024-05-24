const express = require('express'); //chamando o express
const { v4: uuidv4 } = require("uuid"); //chamando biblioteca para criar id aleatorios
const app = express(); //criando função app que utilizará do express
const port = 3000; //definindo a porta

app.use(express.json()); //definindo a declaração para o cliente

const customers = [] // criando um array para receber os usuarios cadastrados

//middleware

function verifyIfExistAccountCPF(req, res, next){
    const { cpf } = req.params;
    const customer = customers.find((customer) => customer.cpf === cpf);
    
    if(!customer){
        return res.status(400).json({error: "Cliente não encontrado"});  
      }

      req.customer = customer;

      return next();
}
app.post('/account', (req, res)=>{ //criando uma route params 
    const {cpf, name} = req.body; //definindo que cpf, name serão preenchidos pelo cliente
    const  customerAlreadyExist  = customers.some( //utilizando de uma configuração do array para mudar uma situação específica de um índice através de uma condição, nesse caso, validando um cpf
        (customer) => customer.cpf ===cpf
    );

        if(customerAlreadyExist){ //Configurando a condição de validação de cpf
            return res.status(400).json({error: "cliente já cadastrado"}); // definindo a mensagem de erro
        }

    customers.push({ // usando push para enviar os dados fornecidos pelo cliente para dentro do array
        cpf,
        name,
        id: uuidv4,
        statement: []
    });

    return res.status(201).send('Usuario cadastrado'); // mensagem de bem sucedido
})
    
app.get('/statement/:cpf', verifyIfExistAccountCPF, (req, res) =>{
    const { customer } = req;
    return res.json(customer.statement);
});


app.post('/deposit/:cpf', verifyIfExistAccountCPF, (req,res)=>{
    const { description, amount} = req.body;
    const { customer } = req;
    const statementOperation ={
        description,
        amount,
        create_at: new Date(),
        type: "credit"

    }

    customer.statement.push(statementOperation);
    return res.status(201).send("Deposito Realizado");
});

app.post('/withdraw/:cpf', verifyIfExistAccountCPF, (req, res) => {
    const { amount } = req.body;
    const { customer } = req;

    const balance = customer.statement.reduce((acc, operation) =>{
        if (operation.type ==='credit'){
            return acc + operation.amount;

        } else {
            return acc - operation.amount;
        }
    }, 0); 

    if (balance < amount) {
        return res.status(400).json({ error: "Saldo insuficiente!"});    
    }

    const statementOperation ={
        amount,
        create_at: new Date(),
        type: "debit"
    };

    customer.statement.push(statementOperation);
    return res.status(201).send("Saque realizado");
});

app.get('/statement/:cpf/date', verifyIfExistAccountCPF, (req, res) =>{
    const { customer } = req;
    const { date } = req.query;

    const dateFormat = new Date(date + "00:00")

    const statement = customer.statement.filter((statement) => statement.create_at.toDateString()=== new Date(dateFormat).toDateString())
    return res.json(statement);
});

app.put('/account/:cpf', verifyIfExistAccountCPF, (req, res) => {
   const { name } = req.body;
   const { customer } = req;

   customer.name = name;

   return res.status(201).send("Usuario atualizado");
});

app.get('/account/:cpf', verifyIfExistAccountCPF, (req, res) => {
    const { customer } = req;

    return res.json(customer);

})

app.get('/customers', (req,res) =>{
    return res.json(customers);
});

app.delete('/account/:cpf', verifyIfExistAccountCPF, (req, res) =>{
    const { customer } = req;

    //splice

    customers.splice(customer, 1);

    return res.status(200).json(customers);
    
});

app.listen(port, () => { //rodando o servidor
    console.log(`Rodando na porta: ${port}`);
});