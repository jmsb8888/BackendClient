"use strict";
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
exports.createKeypairFromFile = exports.getPayer = exports.getRpcUrl = void 0;
// Importa las clases y funciones nesesarias desde la  libreria '@solana/web3.js'.
var os = require("os");
// Utiliza el módulo 'fs' para trabajar con operaciones de archivos de forma asíncrona.
var fs = require("fs/promises");
// Utiliza el módulo 'path' para gestionar rutas de archivos y directorios.
var path = require("path");
// Importa la libreria 'yaml' para trabajar con archivos YAML.
var yaml = require("yaml"); // Importa el módulo 'yaml' para analizar archivos YAML.
// Importa las funciones nesesarias para trabajar las claves de acceso desde la libreria '@solana/web3.js'.
var web3_js_1 = require("@solana/web3.js"); // Importa la clase 'Keypair' de la biblioteca '@solana/web3.js'.
/**
 * Realiza la obtención de la ruta que apunta a la configuración de Solana
 */
function getConfig() {
    return __awaiter(this, void 0, void 0, function () {
        var CONFIG_FILE_PATH, configYml;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    CONFIG_FILE_PATH = path.resolve(os.homedir(), '.config', 'solana', 'cli', 'config.yml');
                    return [4 /*yield*/, fs.readFile(CONFIG_FILE_PATH, { encoding: 'utf8' })];
                case 1:
                    configYml = _a.sent();
                    return [2 /*return*/, yaml.parse(configYml)]; // Devuelve la configuración analizada
            }
        });
    });
}
/**
 * Carga y analiza el archivo de configuración del Solana CLI para determinar qué URL RPC utilizar
 */
function getRpcUrl() {
    return __awaiter(this, void 0, void 0, function () {
        var config, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, getConfig()];
                case 1:
                    config = _a.sent();
                    if (!config.json_rpc_url)
                        throw new Error('URL RPC faltante');
                    // Devuelve la URL RPC desde la configuración
                    return [2 /*return*/, config.json_rpc_url];
                case 2:
                    err_1 = _a.sent();
                    console.warn('No se pudo leer la URL RPC desde el archivo de configuración del CLI de Solana, usando localhost por defecto');
                    // Si falla, usa una URL RPC local por defecto
                    return [2 /*return*/, 'http://127.0.0.1:8899'];
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.getRpcUrl = getRpcUrl;
/**
 * Carga y analiza el archivo de configuración del Solana CLI para determinar qué clave publica de la cuenta de pago a utilizar
 */
function getPayer() {
    return __awaiter(this, void 0, void 0, function () {
        var config, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, getConfig()];
                case 1:
                    config = _a.sent();
                    if (!config.keypair_path)
                        throw new Error('Ruta de clave faltante');
                    return [4 /*yield*/, createKeypairFromFile(config.keypair_path)];
                case 2: 
                // Devuelve la clave de pago desde la configuración
                return [2 /*return*/, _a.sent()];
                case 3:
                    err_2 = _a.sent();
                    console.warn('No se pudo crear la clave de pago desde el archivo de configuración del CLI de Solana, generando una nueva clave aleatoria por defecto');
                    // Si falla, genera una nueva clave de pago aleatoria
                    return [2 /*return*/, web3_js_1.Keypair.generate()];
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.getPayer = getPayer;
/**
 * Crea un Keypair a partir de una clave secreta almacenada en un archivo como una matriz de bytes
 */
function createKeypairFromFile(filePath) {
    return __awaiter(this, void 0, void 0, function () {
        var secretKeyString, secretKey;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fs.readFile(filePath, { encoding: 'utf8' })];
                case 1:
                    secretKeyString = _a.sent();
                    secretKey = Uint8Array.from(JSON.parse(secretKeyString));
                    // Crea un Keypair a partir de la clave secreta del archivo
                    return [2 /*return*/, web3_js_1.Keypair.fromSecretKey(secretKey)];
            }
        });
    });
}
exports.createKeypairFromFile = createKeypairFromFile;
