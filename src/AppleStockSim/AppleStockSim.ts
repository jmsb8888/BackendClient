/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

// Importa las clases y funciones nesesarias desde la  libreria '@solana/web3.js'.
import {
  Keypair,
  Connection,
  PublicKey,
  LAMPORTS_PER_SOL,
  SystemProgram,
  TransactionInstruction,
  Transaction,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
// Utiliza el módulo 'fs' para trabajar con operaciones de archivos de forma asíncrona.
import * as fs from 'fs/promises';
// Utiliza el módulo 'path' para gestionar rutas de archivos y directorios.
import * as path from 'path';
// Incorpora la biblioteca 'borsh' para facilitar la serialización y deserialización de datos.
import * as borsh from 'borsh';
// Importa funciones útiles desde el archivo './utils'.
import {getPayer, getRpcUrl, createKeypairFromFile} from './utils';

/**
 * Conexión a la red blockchain de Solana
 */
let connection: Connection;

/**
 * claves asosciadas a la cuenta de pago
 */
let payer: Keypair;

/**
 * ID del programa "AppleStockSim"
 */
let programId: PublicKey;

/**
 * La clave pública de la cuenta en la que se está comprando
 */
let buyPubkey: PublicKey;

/**
 * Ruta a los archivos binarios del contrato desplegado y a las claves del mismo
 */
const PROGRAM_PATH = path.resolve(__dirname, '../dist/program');

/**
 * ruta especifica al archivo objeto del contrato desplegado en solana.
 * Este archivo se crea al ejecutar cualquiera de los siguientes comandos:
 *   - `npm run build:program-rust`
 */
const PROGRAM_SO_PATH = path.join(PROGRAM_PATH, 'apple_stock_sim.so');

/**
 * Ruta al par de claves del programa desplegado.
 * Este archivo se crea al ejecutar `solana program deploy dist/program/AppleStockSim.so`.
 */
const PROGRAM_KEYPAIR_PATH = path.join(PROGRAM_PATH, 'apple_stock_sim-keypair.json');

/**
 * El estado de una cuenta de compra gestionada por el programa "AppleStockSim"
 */
class BuyAccount {
  counter = 0;
  constructor(fields: {counter: number} | undefined = undefined) {
    if (fields) {
      this.counter = fields.counter;
    }
  }
}

/**
 * Definición de esquema Borsh para cuentas de compra
 */
const BuySchema = new Map([
  [BuyAccount, {kind: 'struct', fields: [['counter', 'u32']]}],
]);

/**
 * El tamaño esperado de cada cuenta de compra.
 */
const BUY_SIZE = borsh.serialize(
    BuySchema,
    new BuyAccount(),
).length;

/**
 * Establece una conexión con la red de solana (devnet)
 */
export async function establishConnection(): Promise<void> {
  const rpcUrl = await getRpcUrl();
  connection = new Connection(rpcUrl, 'confirmed'); // Crea una conexión a la red de Solana.
  const version = await connection.getVersion(); // Obtiene la versión de la red.
  console.log('Conexión a la red establecida:', rpcUrl, version);
}

/**
 * Establece una cuenta para pagar todas las tarifas
 */
export async function establishPayer(): Promise<string> {
  let fees = 0;
  if (!payer) {
    const {feeCalculator} = await connection.getRecentBlockhash();

    // Calcula el costo para financiar la cuenta de compra
    fees += await connection.getMinimumBalanceForRentExemption(BUY_SIZE);

    // Calcula el costo de enviar transacciones
    fees += feeCalculator.lamportsPerSignature * 100; // wag

    payer = await getPayer(); // Obtiene la clave del pagador.
  }

  let lamports = await connection.getBalance(payer.publicKey);
  if (lamports < fees) {
    // Si el saldo actual no es suficiente para pagar las tarifas, solicita un airdrop.
    const sig = await connection.requestAirdrop(
        payer.publicKey,
        fees - lamports,
    );
    await connection.confirmTransaction(sig); // Confirma la transacción del airdrop.
    lamports = await connection.getBalance(payer.publicKey); // Actualiza el saldo.
  }
  const information = '\"billetera\": \"'+payer.publicKey.toBase58() +'\", \"balance\": ' + lamports / LAMPORTS_PER_SOL+', ';
  return information;
  console.log(
      'Usando la cuenta',
      payer.publicKey.toBase58(),
      'que contiene',
      lamports / LAMPORTS_PER_SOL,
      'SOL para pagar las tarifas',
  );
}

/**
 * Comprueba si el programa "AppleStockSim" desplegado se ha implementado
 */
export async function checkProgram(): Promise<string> {
  // Lee el ID del programa desde el archivo de par de claves
  try {
    const programKeypair = await createKeypairFromFile(PROGRAM_KEYPAIR_PATH);
    programId = programKeypair.publicKey;
  } catch (err) {
    const errMsg = (err as Error).message;
    throw new Error(
        `No se pudo leer el par de claves del programa en '${PROGRAM_KEYPAIR_PATH}' debido al error: ${errMsg}. 
        Es posible que el programa deba implementarse con \`solana program deploy dist/program/AppleStockSim.so\``,
    );
  }
  // Comprueba si el programa se ha implementado
  const programInfo = await connection.getAccountInfo(programId);
  if (programInfo === null) {
    if (await  fs.access(PROGRAM_SO_PATH).then(() => true).catch(() => false)) {
      throw new Error(
          'El programa debe implementarse con `solana program deploy dist/program/AppleStockSim.so`',
      );
    } else {
      throw new Error('El programa debe compilarse e implementarse');
    }
  } else if (!programInfo.executable) {
    throw new Error(`El programa no es ejecutable`);
  }
  const information = '\"idContrato\": \"'+programId.toBase58()+'\"}';

  console.log(`Usando el programa ${programId.toBase58()}`);

  // Deriva la dirección (clave pública) de una cuenta de compra a partir del programa para que sea fácil de encontrar más tarde.
  const BUY_SEED = 'compra';
  buyPubkey = await PublicKey.createWithSeed(
      payer.publicKey,
      BUY_SEED,
      programId,
  );

  // Comprueba si la cuenta de compra ya ha sido creada
  const buyAccount = await connection.getAccountInfo(buyPubkey);
  if (buyAccount === null) {
    console.log(
        'Creando cuenta',
        buyPubkey.toBase58(),
        '',
    );
    const lamports = await connection.getMinimumBalanceForRentExemption(
        BUY_SIZE,
    );

    const transaction = new Transaction().add(
        SystemProgram.createAccountWithSeed({
          fromPubkey: payer.publicKey,
          basePubkey: payer.publicKey,
          seed: BUY_SEED,
          newAccountPubkey: buyPubkey,
          lamports,
          space: BUY_SIZE,
          programId,
        }),
    );
    await sendAndConfirmTransaction(connection, transaction, [payer]);
  }
  return information;
}

/**
 * Realiza la compra de acciones mediante el contrato implementado
 */
export async function sharePurchase(): Promise<void> {
  console.log('Comprando acccion en cuenta :', buyPubkey.toBase58());
  const instruction = new TransactionInstruction({
    keys: [{pubkey: buyPubkey, isSigner: false, isWritable: true}],
    programId,
    data: Buffer.alloc(0), // Todas las instrucciones son compras
  });
  await sendAndConfirmTransaction(
      connection,
      new Transaction().add(instruction),
      [payer],
  );
}

/**
 * Informa la cantidad de veces que se ha comprado una accion en la cuenta dada
 */
export async function reportBuys(): Promise<string> {
  const accountInfo = await connection.getAccountInfo(buyPubkey);
  if (accountInfo === null) {
    throw 'Error: no se puede encontrar la cuenta de compra';
  }
  const buy = borsh.deserialize(
      BuySchema,
      BuyAccount,
      accountInfo.data,
  );
  const information = '{\"cuenta\": \"'+buyPubkey.toBase58() +'\", \"cantidad\": ' +buy.counter+', ';
  return  information;
  console.log(
      buyPubkey.toBase58(),
      'ha comprado',
      buy.counter,
      'vez/veces',
  );
}

