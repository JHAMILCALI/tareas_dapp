# 📝 DApp de Tareas Web3

Aplicación descentralizada (DApp) que permite crear, leer y visualizar tareas directamente en la blockchain de Ethereum (Red Sepolia) utilizando un contrato inteligente. Desarrollada con **React + Vite**, **Tailwind CSS** y **ethers.js**, con conexión a **MetaMask**.

---

## 🚀 Características

- ✅ Conexión con MetaMask
- 📝 Crear tareas en la blockchain
- 📄 Listar tareas almacenadas en el contrato
- 🌐 Desplegada en la red de pruebas Sepolia
- 🎨 Interfaz minimalista con Tailwind CSS

---

## 🛠️ Tecnologías

- [React + Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [ethers.js](https://docs.ethers.org/)
- [Solidity (Remix IDE)](https://remix.ethereum.org/)
- [MetaMask](https://metamask.io/)

---
## [🧩 Ver el contrato en ETHescan](https://sepolia.etherscan.io/address/0xf13aeb265db8b6cf512665cfad79a94bbfe19503)
## [👉 Pagina en funcionaminto vercel](https://tareas-dapp.vercel.app/)
## 📦 Instalación

```bash
# Clona el repositorio
git clone https://github.com/JHAMILCALI/tareas_dapp.git
cd tareas-dapp

# Instala dependencias
npm install
```
## 🧪 Configura Tailwind CSS (si no lo tienes)

```bash
npm install tailwindcss @tailwindcss/vite
```
## ✅ Versión estable recomendada
Si quieres asegurar que tienes la versión más estable de ethers, instala esta:

```bash
npm install ethers@5
```
## ⚙️ Variables importantes
En el archivo App.jsx, asegúrate de tener:
```js
const direccionContrato = "0xTU_CONTRATO_DEPLOYADO_EN_SEPOLIA";
```
Tu contrato inteligente debe estar desplegado en la red Sepolia usando Remix con la ABI exportada en src/contracts/ContratoDeTareas.json.

## ▶️ Ejecutar el proyecto
```bash
npm run dev
```
## 📜 Contrato Inteligente (Solidity)
```js
// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.6;

contract ContratoDeTareas {
    uint siguienteId;

    struct Tarea {
        uint id;
        string nombre;
        string descripcion;
    }

    Tarea[] tareas;

    function crearTarea(string memory _nombre, string memory _descripcion) public {
        tareas.push(Tarea(siguienteId, _nombre, _descripcion));
        siguienteId++;
    }

    function encontrarIndice(uint _id) internal view returns (uint) {
        for (uint i = 0; i < tareas.length; i++) {
            if (tareas[i].id == _id) {
                return i;
            }
        }
        revert("Tarea no encontrada");
    }

    function leerTarea(uint _id) public view returns (uint, string memory, string memory) {
        uint indice = encontrarIndice(_id);
        return (tareas[indice].id, tareas[indice].nombre, tareas[indice].descripcion);
    }

    function actualizarTarea(uint _id, string memory _nombre, string memory _descripcion) public {
        uint indice = encontrarIndice(_id);
        tareas[indice].nombre = _nombre;
        tareas[indice].descripcion = _descripcion;
    }

    function eliminarTarea(uint _id) public {
        uint indice = encontrarIndice(_id);
        delete tareas[indice];
    }
}

```