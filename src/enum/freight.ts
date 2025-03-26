export enum FreightLocal {
  NATIONAL = 'Nacional',
  INTERNATIONAL = 'Internacional',
}

export enum TypeOfLoad {
  COMPLETE = 'Completa',
  COMPLEMENT = 'Complemento',
}

export enum SpecieOfLoad {
  ANIMAL = 'Animais',
  BIGBAG = 'Big Bag',
  COIL = 'Bobina',
  BOX = 'Caixas',
  CONTAINER = 'Container',
  OTHERS = 'Diversos',
  BALES = 'Fardos',
  FRACTIONAL = 'Fracionada',
  BULK = 'Granel',
  METRIC_CUBIC = 'Metro cúbico',
  MILHEIRO = 'Milheiro',
  CHANGES = 'Mudanças',
  PALLETS = 'Palhetes',
  PASSENGER = 'Passageiros',
  BAGS = 'Sacos',
  DRUM = 'Tambor',
  UNITYS = 'Unidades',
}

export enum UnityMetric {
  BYTONS = 'Por toneladas',
  BYWEIGHT = 'Por quilos',
  BYPALLETS = 'Por palhetes',
}

export enum PaymentMethod {
  VALORCONFIRMED = 'Já sei o valor',
  TOCOMBINE = 'A combinar',
}

export enum Toll {
  INCLUEDVALUE = 'Incluso no valor',
  PAYMENTPARTY = 'Pago a parte',
}
