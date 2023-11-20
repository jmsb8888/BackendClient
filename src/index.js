/*
* Archivo de inicio del programa, contiene el endPoint para ejecutar asi como el orden de ejecución,
*/

/*
* Establece las importaciones de las funciones necesarias para la activación del cliente del contrato
*/
const express = require('express');
const {
    // Función para establecer una conexión a la red de Solana
    establishConnection,
    // Función para determinar quién paga las tarifas
    establishPayer,
    // Función para verificar si el programa está implementado
    checkProgram,
    // Función para realizar una operación de "vender libro"
    sellBook,
    // Función para obtener el número de compras realizadas
    reportBuys, sharePurchase,
} = require('./AppleStockSim');
//define punto de entrada
const app = express();
const cors = require('cors');
//puerto donde se abrira la aplicación
const port = 666;
app.use(cors());

app.get('/execute-solana-code', async (req, res) => {
    try {
        console.log('Solana account...zzzz');
        // Establece una conexión con el clúster de Solana
        await establishConnection();
        // Determina la cuenta que realizara el pago de la transacción
        const payer= await establishPayer();
        console.log(payer);
        // Verifica si el programa ha sido implementado correctamente
        const idProgram=await checkProgram();
        console.log(idProgram)
        // Realiza una operación de "comprar acción"
        await sharePurchase();
        const buys =  await reportBuys();
        console.log(buys);

        res.status(200).send(buys+payer+idProgram);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error en la ejecución del código');
    }
});

app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
