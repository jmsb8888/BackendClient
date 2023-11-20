// Importa las clases y funciones nesesarias desde la  libreria '@solana/web3.js'.
import * as os from 'os';
// Utiliza el módulo 'fs' para trabajar con operaciones de archivos de forma asíncrona.
import * as fs from 'fs/promises';
// Utiliza el módulo 'path' para gestionar rutas de archivos y directorios.
import * as path from 'path';
// Importa la libreria 'yaml' para trabajar con archivos YAML.
import * as yaml from 'yaml';// Importa el módulo 'yaml' para analizar archivos YAML.
// Importa las funciones nesesarias para trabajar las claves de acceso desde la libreria '@solana/web3.js'.
import {Keypair} from '@solana/web3.js'; // Importa la clase 'Keypair' de la biblioteca '@solana/web3.js'.

/**
 * Realiza la obtención de la ruta que apunta a la configuración de Solana
 */
async function getConfig(): Promise<any> {
  // Ruta al archivo de configuración del Solana CLI
  const CONFIG_FILE_PATH = path.resolve(
      os.homedir(),
      '.config',
      'solana',
      'cli',
      'config.yml',
  );
  // Lee el contenido del archivo de configuración y lo analiza como YAML
  const configYml = await fs.readFile(CONFIG_FILE_PATH, {encoding: 'utf8'});
  return yaml.parse(configYml); // Devuelve la configuración analizada
}

/**
 * Carga y analiza el archivo de configuración del Solana CLI para determinar qué URL RPC utilizar
 */
export async function getRpcUrl(): Promise<string> {
  try {
    const config = await getConfig();
    if (!config.json_rpc_url) throw new Error('URL RPC faltante');
    // Devuelve la URL RPC desde la configuración
    return config.json_rpc_url;
  } catch (err) {
    console.warn(
        'No se pudo leer la URL RPC desde el archivo de configuración del CLI de Solana, usando localhost por defecto',
    );
    // Si falla, usa una URL RPC local por defecto
    return 'http://127.0.0.1:8899';
  }
}

/**
 * Carga y analiza el archivo de configuración del Solana CLI para determinar qué clave publica de la cuenta de pago a utilizar
 */
export async function getPayer(): Promise<Keypair> {
  try {
    const config = await getConfig();
    if (!config.keypair_path) throw new Error('Ruta de clave faltante');
    // Devuelve la clave de pago desde la configuración
    return await createKeypairFromFile(config.keypair_path);
  } catch (err) {
    console.warn(
        'No se pudo crear la clave de pago desde el archivo de configuración del CLI de Solana, generando una nueva clave aleatoria por defecto',
    );
    // Si falla, genera una nueva clave de pago aleatoria
    return Keypair.generate();
  }
}

/**
 * Crea un Keypair a partir de una clave secreta almacenada en un archivo como una matriz de bytes
 */
export async function createKeypairFromFile(
    filePath: string,
): Promise<Keypair> {
  const secretKeyString = await fs.readFile(filePath, {encoding: 'utf8'});
  const secretKey = Uint8Array.from(JSON.parse(secretKeyString));
  // Crea un Keypair a partir de la clave secreta del archivo
  return Keypair.fromSecretKey(secretKey);
}
