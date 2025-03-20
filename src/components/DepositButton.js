// components/DepositButton.js
import { useState } from 'react';

export default function DepositButton({ onDeposit }) {
  const [isOpen, setIsOpen] = useState(false);
  const [total, setTotal] = useState('');
  const [sol, setSol] = useState('');
  const [usdc, setUsdc] = useState('');

  const handleSubmit = () => {
    onDeposit({ total, sol, usdc });
    setIsOpen(false);
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Deposit</button>
      {isOpen && (
        <div className="modal">
          <h2>Depósito</h2>
          <input
            type="number"
            placeholder="Total"
            value={total}
            onChange={(e) => setTotal(e.target.value)}
          />
          <input
            type="number"
            placeholder="SOL"
            value={sol}
            onChange={(e) => setSol(e.target.value)}
          />
          <input
            type="number"
            placeholder="USDC"
            value={usdc}
            onChange={(e) => setUsdc(e.target.value)}
          />
          <button onClick={handleSubmit}>Confirmar</button>
          <button onClick={() => setIsOpen(false)}>Cancelar</button>
        </div>
      )}
    </>
  );
}
