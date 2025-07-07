import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import contratoJson from './contracts/ContratoDeTareas.json';
import './index.css';
const direccionContrato = "0xF13aeb265DB8B6Cf512665cfAd79A94bbfE19503";

function App() {
  const [cuenta, setCuenta] = useState('');
  const [contrato, setContrato] = useState(null);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [tareas, setTareas] = useState([]);
  const [loading, setLoading] = useState(false);

  const conectarWallet = async () => {
    if (window.ethereum) {
      try {
        const cuentas = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setCuenta(cuentas[0]);

        const proveedor = new ethers.providers.Web3Provider(window.ethereum);
        const signer = proveedor.getSigner();
        const instanciaContrato = new ethers.Contract(direccionContrato, contratoJson.abi, signer);
        setContrato(instanciaContrato);
        console.log("Contrato conectado:", instanciaContrato);
      } catch (error) {
        console.error("Error al conectar wallet:", error);
      }
    } else {
      alert("Instala MetaMask");
    }
  };

  const crearTarea = async () => {
    if (!contrato) return alert("Conecta tu wallet primero");
    if (!nombre || !descripcion) return alert("Completa todos los campos");

    try {
      setLoading(true);
      const tx = await contrato.crearTarea(nombre, descripcion);
      await tx.wait();
      setNombre('');
      setDescripcion('');
      obtenerTareas();
    } catch (err) {
      console.error("Error al crear tarea:", err);
    } finally {
      setLoading(false);
    }
  };

  const obtenerTareas = async () => {
    if (!contrato) return;
    let nuevasTareas = [];
    for (let i = 0; i < 100; i++) {
      try {
        const tarea = await contrato.leerTarea(i);
        const [nombre, descripcion] = tarea;
        if (nombre && descripcion) {
          nuevasTareas.push(tarea);
        }
      } catch (error) {
        console.error("Error al obtener tarea:", error);
        break;
      }
    }
    setTareas(nuevasTareas);
  };

  useEffect(() => {
    if (window.ethereum) {
      conectarWallet();
    }
  }, []);

  useEffect(() => {
    if (contrato) obtenerTareas();
  }, [contrato]);

  return (
    <div className="min-h-screen bg-gray-100 px-6 py-8 font-sans">
      <div className="max-w-xl mx-auto bg-white shadow-lg rounded-xl p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 text-center">Administrador de Tareas Web3</h1>

        {!contrato && <p className="text-red-500 text-center">⚠️ Contrato no conectado</p>}

        {cuenta ? (
          <p className="text-green-600 text-sm text-center mb-4">✅ Cuenta conectada: <strong>{cuenta}</strong></p>
        ) : (
          <div className="flex justify-center mb-4">
            <button
              onClick={conectarWallet}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded"
            >
              Conectar Wallet
            </button>
          </div>
        )}

        <div className="space-y-3 mb-6">
          <input
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            placeholder="Nombre de la tarea"
          />
          <input
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            value={descripcion}
            onChange={e => setDescripcion(e.target.value)}
            placeholder="Descripción"
          />
          <button
            onClick={crearTarea}
            disabled={loading}
            className={`w-full bg-indigo-600 text-white font-semibold py-2 rounded hover:bg-indigo-700 transition ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Creando...' : 'Crear Tarea'}
          </button>
        </div>

        <ul className="space-y-3">
          {tareas.length === 0 && (
            <p className="text-gray-500 text-center">No hay tareas registradas aún.</p>
          )}
          {tareas.map(([id, nombre, descripcion]) => (
            <li key={id} className="bg-gray-100 p-3 rounded border border-gray-200">
              <p className="font-semibold text-gray-800">{nombre}</p>
              <p className="text-gray-600">{descripcion}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
