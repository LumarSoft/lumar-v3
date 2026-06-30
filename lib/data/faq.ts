// Preguntas frecuentes.
// Para agregar una: sumá un objeto { question, answer } al array.

export type FaqItem = {
  question: string
  answer: string
}

export const faqs: FaqItem[] = [
  {
    question: "¿Cuánto tarda un proyecto?",
    answer:
      "Depende del alcance, pero te damos una fecha real desde el día uno, no una optimista. Una landing puede estar en una o dos semanas; un sistema a medida lleva más. Dividimos todo en hitos claros y vos aprobás cada etapa antes de avanzar.",
  },
  {
    question: "¿Cuánto cuesta un proyecto?",
    answer:
      "No trabajamos con precios de lista, porque cada proyecto es distinto. Después de entender qué necesitás, te pasamos un presupuesto cerrado y sin letra chica. Si algo se sale del alcance, lo hablamos antes; nunca te aparece una sorpresa en la factura.",
  },
  {
    question: "Ya tuve una mala experiencia con un desarrollador que desapareció. ¿Por qué sería distinto?",
    answer:
      "Porque hablás directamente con quien construye tu proyecto, no con un vendedor que después te pasa a otro equipo. Somos tres y trabajamos cada proyecto de principio a fin. No hay intermediarios donde se pierda la comunicación.",
  },
  {
    question: "No tengo todo definido todavía. ¿Igual puedo escribirles?",
    answer:
      "Sí, de hecho es lo ideal. No hace falta que llegues con un pliego cerrado. Contanos el problema y evaluamos juntos qué tiene sentido construir, con qué alcance y en qué tiempo. Esa charla no tiene costo ni compromiso.",
  },
  {
    question: "¿El código y el proyecto quedan míos?",
    answer:
      "Totalmente. Entregamos código limpio y documentado, sin dependencias artificiales con nosotros. Si el día de mañana querés seguir con otro equipo, podés. El proyecto es tuyo.",
  },
  {
    question: "¿Trabajan con clientes fuera de Rosario o de Argentina?",
    answer:
      "Sí. Trabajamos en remoto con clientes de todo el país y del exterior. La comunicación directa funciona igual de bien por videollamada y WhatsApp que en persona.",
  },
]
