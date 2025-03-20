<div className="mt-6">
  <h2 className="text-lg font-semibold text-center">📌 Minhas Pools</h2>
  {pools.length === 0 ? (
    <p className="text-center text-gray-400 mt-2">Nenhuma pool criada ainda. Comece adicionando uma acima!</p>
  ) : (
    <div className="mt-4 p-4 bg-secondary rounded-lg">
      {pools.map((pool) => (
        <Link href={`/dashboard/pool/${pool.id}`} key={pool.id}>
          <div className="p-4 bg-gray-800 rounded-lg mb-2 cursor-pointer hover:bg-gray-700 transition">
            <h3 className="text-lg font-bold">{pool.pair}</h3>
            <p>Última Entrada: ${pool.balance} | SOL: {pool.sol} | USDC: {pool.usdc}</p>
          </div>
        </Link>
      ))}
    </div>
  )}
</div>
