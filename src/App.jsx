import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import contratoJson from './contracts/ContratoDeTareas.json';

const direccionContrato = "0xF13aeb265DB8B6Cf512665cfAd79A94bbfE19503"; // Asegúrate que es la correcta

function App() {
  const [cuenta, setCuenta] = useState('');
  const [contrato, setContrato] = useState(null);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [tareas, setTareas] = useState([]);
  const [loading, setLoading] = useState(false);

  // Conectar MetaMask y contrato
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
        const [id, nombre, descripcion] = tarea;
        if (nombre && descripcion) {
          nuevasTareas.push(tarea);
        }
      } catch (error) {
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
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Administrador de Tareas Web3</h1>

      {!contrato && <p style={{ color: 'red' }}>⚠️ Contrato no conectado</p>}

      {cuenta ? (
        <p>✅ Cuenta conectada: <strong>{cuenta}</strong></p>
      ) : (
        <button onClick={conectarWallet}>Conectar Wallet</button>
      )}

      <div style={{ marginTop: '20px' }}>
        <input
          value={nombre}
          onChange={e => setNombre(e.target.value)}
          placeholder="Nombre de la tarea"
        />
        <input
          value={descripcion}
          onChange={e => setDescripcion(e.target.value)}
          placeholder="Descripción"
        />
        <button onClick={crearTarea} disabled={loading}>
          {loading ? "Creando..." : "Crear Tarea"}
        </button>
      </div>

      <ul style={{ marginTop: '20px' }}>
        {tareas.map(([id, nombre, descripcion]) => (
          <li key={id}>
            <strong>{nombre}</strong>: {descripcion}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
