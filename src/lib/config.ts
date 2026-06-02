// ─── Configuração do sensor — edite aqui para calibrar ────────────────────────

// Distância do sensor até o fundo do recipiente quando VAZIO (cm).
// Para o balde de 40 cm com sensor no topo: ~30 cm.
export const DRAIN_DEPTH_CM = 30;

// Limiares de nível de água (cm) para ativar os alertas.
export const THRESHOLD_ALERTA = 10;  // ≈ 33 % do balde → atenção
export const THRESHOLD_CRITICO = 20; // ≈ 67 % do balde → crítico
