import type { Draw } from "../domain/draw";

const people = [
  { id: "ana", name: "Ana", email: "ana@example.com" },
  { id: "lucia", name: "Lucía", email: "lucia@example.com" },
  { id: "pablo", name: "Pablo", email: "pablo@example.com" },
  { id: "marcos", name: "Marcos", email: "marcos@example.com" },
  { id: "carmen", name: "Carmen", email: "carmen@example.com" },
  { id: "dani", name: "Dani", email: "dani@example.com" },
];

export const demoDraws: Draw[] = [
  {
    id: "pandilla",
    title: "La pandilla de siempre",
    description:
      "Una excusa más para vernos. El regalo es lo de menos, ¡la sorpresa es lo mejor!",
    budgetCents: 2500,
    date: "2026-12-19",
    status: "drawn",
    participants: people,
    exclusions: [],
    currentParticipantId: "ana",
    demoRecipientId: "lucia",
    color: "blue",
    wishlists: {
      ana: [
        {
          id: "w1",
          title: "Una libreta para mis ideas",
          note: "Me gustan las de papel punteado y tapas de colores.",
          link: "",
        },
      ],
      lucia: [
        {
          id: "w2",
          title: "Algo para mi rincón de lectura",
          note: "Una taza bonita, una novela o una vela. ¡Me encantan las sorpresas!",
          link: "",
        },
      ],
    },
  },
  {
    id: "sobremesa",
    title: "Club de la sobremesa",
    description: "Regalos, café y una sobremesa de las que se alargan.",
    budgetCents: 2000,
    date: "2026-12-12",
    status: "draft",
    participants: people.slice(0, 4).map((p) => ({ ...p, id: `s-${p.id}` })),
    exclusions: [],
    currentParticipantId: "s-ana",
    wishlists: {},
    color: "coral",
  },
];
