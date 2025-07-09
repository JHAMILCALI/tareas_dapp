import { useEffect, useState,useRef } from 'react';
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
  const [modoEdicion, setModoEdicion] = useState(false);
  const [idEdicion, setIdEdicion] = useState(null);
  const formularioRef = useRef(null);
  const finListaRef = useRef(null);


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
      await obtenerTareas();
      if (finListaRef.current) {
        finListaRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } catch (err) {
      console.error("Error al crear tarea:", err);
    } finally {
      setLoading(false);
    }
  };

  const actualizarTarea = async () => {
    if (!contrato || idEdicion === null) return;
    if (!nombre || !descripcion) return alert("Completa todos los campos");

    try {
      setLoading(true);
      const tx = await contrato.actualizarTarea(idEdicion, nombre, descripcion);
      await tx.wait();
      setNombre('');
      setDescripcion('');
      setIdEdicion(null);
      setModoEdicion(false);
      obtenerTareas();
    } catch (error) {
      console.error("Error al actualizar tarea:", error);
    } finally {
      setLoading(false);
    }
  };

  const eliminarTarea = async (id) => {
    if (!contrato) return;

    try {
      const tx = await contrato.eliminarTarea(id);
      await tx.wait();
      obtenerTareas();
    } catch (error) {
      console.error("Error al eliminar tarea:", error);
    }
  };

  const editarTarea = (id, nombre, descripcion) => {
  setModoEdicion(true);
  setIdEdicion(id);
  setNombre(nombre);
  setDescripcion(descripcion);

  // Desplazar hacia el formulario
  if (formularioRef.current) {
    formularioRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};


  const obtenerTareas = async () => {
  if (!contrato) return;

  const nuevasTareas = [];
  let erroresSeguidos = 0;
  const maxErroresSeguidos = 10;

  for (let i = 0; i < 1000; i++) {
    try {
      const tarea = await contrato.leerTarea(i);
      const [id, nombre, descripcion] = tarea;

      const estaEliminada = nombre.trim() === "" && descripcion.trim() === "";

      if (!estaEliminada) {
        nuevasTareas.push([id.toNumber(), nombre, descripcion]);
        erroresSeguidos = 0; 
      } else {
        erroresSeguidos++;
      }

      if (erroresSeguidos >= maxErroresSeguidos) break;

    } catch (error) {
      console.error("Error al leer tarea en el índice", i, error);
      console.warn("Tarea no encontrada en el índice", i);
      erroresSeguidos++;
      if (erroresSeguidos >= maxErroresSeguidos) break;
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

        <div ref={formularioRef} className="space-y-3 mb-6">
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
            onClick={modoEdicion ? actualizarTarea : crearTarea}
            disabled={loading}
            className={`w-full ${modoEdicion ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-indigo-600 hover:bg-indigo-700'} text-white font-semibold py-2 rounded transition ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading
              ? modoEdicion
                ? 'Actualizando...'
                : 'Creando...'
              : modoEdicion
              ? 'Actualizar Tarea'
              : 'Crear Tarea'}
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
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => editarTarea(id, nombre, descripcion)}
                  className="bg-yellow-400 text-white px-3 py-1 rounded hover:bg-yellow-500 text-sm"
                >
                  Editar
                </button>
                <button
                  onClick={() => eliminarTarea(id)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
                >
                  Eliminar
                </button>
              </div>
            </li>
          ))}
          <div ref={finListaRef}></div>
        </ul>
      </div>
    </div>
  );
}

export default App;
