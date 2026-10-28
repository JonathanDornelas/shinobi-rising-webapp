// A biblioteca dos dados 3D não traz tipos; o uso fica restrito a src/lib/rolagens/dados3d.ts.
declare module '@3d-dice/dice-box-threejs' {
	export default class DiceBox {
		constructor(seletor: string, config?: Record<string, unknown>);
	}
}
