"use strict";
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportBuys = exports.sharePurchase = exports.checkProgram = exports.establishPayer = exports.establishConnection = void 0;
// Importa las clases y funciones nesesarias desde la  libreria '@solana/web3.js'.
var web3_js_1 = require("@solana/web3.js");
// Utiliza el módulo 'fs' para trabajar con operaciones de archivos de forma asíncrona.
var fs = require("fs/promises");
// Utiliza el módulo 'path' para gestionar rutas de archivos y directorios.
var path = require("path");
// Incorpora la biblioteca 'borsh' para facilitar la serialización y deserialización de datos.
var borsh = require("borsh");
// Importa funciones útiles desde el archivo './utils'.
var utils_1 = require("./utils");
/**
 * Conexión a la red blockchain de Solana
 */
var connection;
/**
 * claves asosciadas a la cuenta de pago
 */
var payer;
/**
 * ID del programa "AppleStockSim"
 */
var programId;
/**
 * La clave pública de la cuenta en la que se está comprando
 */
var buyPubkey;
/**
 * Ruta a los archivos binarios del contrato desplegado y a las claves del mismo
 */
var PROGRAM_PATH = path.resolve(__dirname, '../dist/program');
/**
 * ruta especifica al archivo objeto del contrato desplegado en solana.
 * Este archivo se crea al ejecutar cualquiera de los siguientes comandos:
 *   - `npm run build:program-rust`
 */
var PROGRAM_SO_PATH = path.join(PROGRAM_PATH, 'apple_stock_sim.so');
/**
 * Ruta al par de claves del programa desplegado.
 * Este archivo se crea al ejecutar `solana program deploy dist/program/AppleStockSim.so`.
 */
var PROGRAM_KEYPAIR_PATH = path.join(PROGRAM_PATH, 'apple_stock_sim-keypair.json');
/**
 * El estado de una cuenta de compra gestionada por el programa "AppleStockSim"
 */
var BuyAccount = /** @class */ (function () {
    function BuyAccount(fields) {
        if (fields === void 0) { fields = undefined; }
        this.counter = 0;
        if (fields) {
            this.counter = fields.counter;
        }
    }
    return BuyAccount;
}());
/**
 * Definición de esquema Borsh para cuentas de compra
 */
var BuySchema = new Map([
    [BuyAccount, { kind: 'struct', fields: [['counter', 'u32']] }],
]);
/**
 * El tamaño esperado de cada cuenta de compra.
 */
var BUY_SIZE = borsh.serialize(BuySchema, new BuyAccount()).length;
/**
 * Establece una conexión con la red de solana (devnet)
 */
function establishConnection() {
    return __awaiter(this, void 0, void 0, function () {
        var rpcUrl, version;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, utils_1.getRpcUrl)()];
                case 1:
                    rpcUrl = _a.sent();
                    connection = new web3_js_1.Connection(rpcUrl, 'confirmed'); // Crea una conexión a la red de Solana.
                    return [4 /*yield*/, connection.getVersion()];
                case 2:
                    version = _a.sent();
                    console.log('Conexión a la red establecida:', rpcUrl, version);
                    return [2 /*return*/];
            }
        });
    });
}
exports.establishConnection = establishConnection;
/**
 * Establece una cuenta para pagar todas las tarifas
 */
function establishPayer() {
    return __awaiter(this, void 0, void 0, function () {
        var fees, feeCalculator, _a, lamports, sig, information;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    fees = 0;
                    if (!!payer) return [3 /*break*/, 4];
                    return [4 /*yield*/, connection.getRecentBlockhash()];
                case 1:
                    feeCalculator = (_b.sent()).feeCalculator;
                    // Calcula el costo para financiar la cuenta de compra
                    _a = fees;
                    return [4 /*yield*/, connection.getMinimumBalanceForRentExemption(BUY_SIZE)];
                case 2:
                    // Calcula el costo para financiar la cuenta de compra
                    fees = _a + _b.sent();
                    // Calcula el costo de enviar transacciones
                    fees += feeCalculator.lamportsPerSignature * 100; // wag
                    return [4 /*yield*/, (0, utils_1.getPayer)()];
                case 3:
                    payer = _b.sent(); // Obtiene la clave del pagador.
                    _b.label = 4;
                case 4: return [4 /*yield*/, connection.getBalance(payer.publicKey)];
                case 5:
                    lamports = _b.sent();
                    if (!(lamports < fees)) return [3 /*break*/, 9];
                    return [4 /*yield*/, connection.requestAirdrop(payer.publicKey, fees - lamports)];
                case 6:
                    sig = _b.sent();
                    return [4 /*yield*/, connection.confirmTransaction(sig)];
                case 7:
                    _b.sent(); // Confirma la transacción del airdrop.
                    return [4 /*yield*/, connection.getBalance(payer.publicKey)];
                case 8:
                    lamports = _b.sent(); // Actualiza el saldo.
                    _b.label = 9;
                case 9:
                    information = '\"billetera\": \"' + payer.publicKey.toBase58() + '\", \"balance\": ' + lamports / web3_js_1.LAMPORTS_PER_SOL + ', ';
                    return [2 /*return*/, information];
            }
        });
    });
}
exports.establishPayer = establishPayer;
/**
 * Comprueba si el programa "AppleStockSim" desplegado se ha implementado
 */
function checkProgram() {
    return __awaiter(this, void 0, void 0, function () {
        var programKeypair, err_1, errMsg, programInfo, information, BUY_SEED, buyAccount, lamports, transaction;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, utils_1.createKeypairFromFile)(PROGRAM_KEYPAIR_PATH)];
                case 1:
                    programKeypair = _a.sent();
                    programId = programKeypair.publicKey;
                    return [3 /*break*/, 3];
                case 2:
                    err_1 = _a.sent();
                    errMsg = err_1.message;
                    throw new Error("No se pudo leer el par de claves del programa en '".concat(PROGRAM_KEYPAIR_PATH, "' debido al error: ").concat(errMsg, ". \n        Es posible que el programa deba implementarse con `solana program deploy dist/program/AppleStockSim.so`"));
                case 3: return [4 /*yield*/, connection.getAccountInfo(programId)];
                case 4:
                    programInfo = _a.sent();
                    if (!(programInfo === null)) return [3 /*break*/, 6];
                    return [4 /*yield*/, fs.access(PROGRAM_SO_PATH).then(function () { return true; }).catch(function () { return false; })];
                case 5:
                    if (_a.sent()) {
                        throw new Error('El programa debe implementarse con `solana program deploy dist/program/AppleStockSim.so`');
                    }
                    else {
                        throw new Error('El programa debe compilarse e implementarse');
                    }
                    return [3 /*break*/, 7];
                case 6:
                    if (!programInfo.executable) {
                        throw new Error("El programa no es ejecutable");
                    }
                    _a.label = 7;
                case 7:
                    information = '\"idContrato\": \"' + programId.toBase58() + '\"}';
                    console.log("Usando el programa ".concat(programId.toBase58()));
                    BUY_SEED = 'compra';
                    return [4 /*yield*/, web3_js_1.PublicKey.createWithSeed(payer.publicKey, BUY_SEED, programId)];
                case 8:
                    buyPubkey = _a.sent();
                    return [4 /*yield*/, connection.getAccountInfo(buyPubkey)];
                case 9:
                    buyAccount = _a.sent();
                    if (!(buyAccount === null)) return [3 /*break*/, 12];
                    console.log('Creando cuenta', buyPubkey.toBase58(), '');
                    return [4 /*yield*/, connection.getMinimumBalanceForRentExemption(BUY_SIZE)];
                case 10:
                    lamports = _a.sent();
                    transaction = new web3_js_1.Transaction().add(web3_js_1.SystemProgram.createAccountWithSeed({
                        fromPubkey: payer.publicKey,
                        basePubkey: payer.publicKey,
                        seed: BUY_SEED,
                        newAccountPubkey: buyPubkey,
                        lamports: lamports,
                        space: BUY_SIZE,
                        programId: programId,
                    }));
                    return [4 /*yield*/, (0, web3_js_1.sendAndConfirmTransaction)(connection, transaction, [payer])];
                case 11:
                    _a.sent();
                    _a.label = 12;
                case 12: return [2 /*return*/, information];
            }
        });
    });
}
exports.checkProgram = checkProgram;
/**
 * Realiza la compra de acciones mediante el contrato implementado
 */
function sharePurchase() {
    return __awaiter(this, void 0, void 0, function () {
        var instruction;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('Comprando acccion en cuenta :', buyPubkey.toBase58());
                    instruction = new web3_js_1.TransactionInstruction({
                        keys: [{ pubkey: buyPubkey, isSigner: false, isWritable: true }],
                        programId: programId,
                        data: Buffer.alloc(0), // Todas las instrucciones son compras
                    });
                    return [4 /*yield*/, (0, web3_js_1.sendAndConfirmTransaction)(connection, new web3_js_1.Transaction().add(instruction), [payer])];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.sharePurchase = sharePurchase;
/**
 * Informa la cantidad de veces que se ha comprado una accion en la cuenta dada
 */
function reportBuys() {
    return __awaiter(this, void 0, void 0, function () {
        var accountInfo, buy, information;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, connection.getAccountInfo(buyPubkey)];
                case 1:
                    accountInfo = _a.sent();
                    if (accountInfo === null) {
                        throw 'Error: no se puede encontrar la cuenta de compra';
                    }
                    buy = borsh.deserialize(BuySchema, BuyAccount, accountInfo.data);
                    information = '{\"cuenta\": \"' + buyPubkey.toBase58() + '\", \"cantidad\": ' + buy.counter + ', ';
                    return [2 /*return*/, information];
            }
        });
    });
}
exports.reportBuys = reportBuys;
