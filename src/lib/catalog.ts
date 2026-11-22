// Dados estruturados do catálogo inicial (fonte: proprietária). Fotos pendentes de upload.
export type CategorySlug = "novidades" | "blusas" | "croppeds" | "vestidos" | "conjuntos" | "macaquinhos" | "shorts";
export type Availability = "disponivel" | "reservada" | "vendida";

export interface Category { slug: CategorySlug; name: string }
export const CATEGORIES: Category[] = [
  { slug: "novidades", name: "Novidades" },
  { slug: "blusas", name: "Blusas" },
  { slug: "croppeds", name: "Croppeds" },
  { slug: "vestidos", name: "Vestidos" },
  { slug: "conjuntos", name: "Conjuntos" },
  { slug: "macaquinhos", name: "Macaquinhos" },
  { slug: "shorts", name: "Shorts" },
];

export interface ProductImages { main: string; front: string; back: string; detail: string }
export interface Product {
  id: string;
  slug: string;
  name: string;
  brand: string | null;
  category: Exclude<CategorySlug, "novidades">;
  isNew: boolean;
  size: string;
  condition: string;
  price: number; // em centavos
  color: string; // tom aproximado da peça, para o placeholder
  description: string;
  fitNote?: string;
  notice?: string;
  availability: Availability;
  images: ProductImages;
}

const noImg: ProductImages = { main: "", front: "", back: "", detail: "" };
const p = (o: Omit<Product, "images" | "availability" | "isNew"> & { isNew?: boolean }): Product => ({
  isNew: true, availability: "disponivel", images: { ...noImg }, ...o,
});
const USED = "Usada — condição informada no atendimento";

export const SEED_PRODUCTS: Product[] = [
  p({ id: "1", slug: "blusa-cropped-lilimoon-neon", name: "Blusa cropped Lilimoon neon", brand: "Lilimoon", category: "croppeds", size: "16 anos", condition: "Pouco usada", price: 1290, color: "oklch(0.88 0.2 135)", description: "Verde-neon, mangas longas caneladas. Moda teen." }),
  p({ id: "2", slug: "macaquinho-tropical", name: "Macaquinho tropical", brand: null, category: "macaquinhos", size: "P", condition: "Excelente estado", price: 2590, color: "oklch(0.8 0.08 150)", description: "Estampa floral e folhagem verde, rosa e creme. Manga curta soltinha." }),
  p({ id: "3", slug: "short-saia-zara-cinza", name: "Short-saia Zara cinza-claro", brand: "Zara", category: "shorts", size: "M", condition: USED, price: 1899, color: "oklch(0.85 0.005 250)", description: "Uma peça única: saia plissada na frente e short atrás. Cinza-claro." }),
  p({ id: "4", slug: "camisa-cropped-zara-listras", name: "Camisa cropped Zara", brand: "Zara", category: "croppeds", size: "P", condition: USED, price: 1590, color: "oklch(0.86 0.05 235)", description: "Azul-claro de listrinhas, manga curta, gola e dois bolsos frontais.", fitNote: "Cropped muito curto, termina perto dos bolsos." }),
  p({ id: "5", slug: "tunica-longa-azul", name: "Túnica longa azul", brand: null, category: "vestidos", size: "M", condition: USED, price: 1090, color: "oklch(0.55 0.17 255)", description: "Azul vivo, textura waffle, manga curta.", fitNote: "A fenda lateral bem alta, acima da cintura, é detalhe da modelagem — não é avaria. Ideal para usar com short curto por baixo." }),
  p({ id: "6", slug: "cropped-kesses-laranja", name: "Cropped Kesses", brand: "Kesses", category: "croppeds", size: "P", condition: USED, price: 1490, color: "oklch(0.72 0.18 50)", description: "Laranja intenso, alças largas, bojos estruturados com recorte frontal em losango. Zíper somente nas costas." }),
  p({ id: "7", slug: "blusa-trico-vazado-lilas", name: "Blusa de tricô vazado", brand: null, category: "blusas", size: "P", condition: USED, price: 990, color: "oklch(0.82 0.06 330)", description: "Rosada lilás, manga longa, tricô vazado.", notice: "Use com regata ou segunda pele (NÃO acompanha e NÃO está à venda). O preço é somente da blusa de tricô." }),
  p({ id: "8", slug: "camisa-chic-coral-pied-de-poule", name: "Camisa Chic Coral", brand: "Chic Coral", category: "blusas", size: "G (veste P/M)", condition: USED, price: 1290, color: "oklch(0.6 0 0)", description: "Estampa pied-de-poule / xadrez preto e branco, manga longa.", fitNote: "Etiqueta G, mas a forma é pequena: veste aproximadamente P ou M." }),
  p({ id: "9", slug: "conjunto-base-nuclear-verde", name: "Conjunto Base Nuclear", brand: "Base Nuclear", category: "conjuntos", size: "38", condition: USED, price: 2990, color: "oklch(0.65 0.1 145)", description: "Colete aberto verde-médio com short verde correspondente. 2 peças.", notice: "A camiseta usada por baixo pela modelo não acompanha o conjunto." }),
  p({ id: "10", slug: "macacao-malwee-marinho", name: "Macacão Malwee", brand: "Malwee", category: "macaquinhos", size: "16 anos", condition: USED, price: 1490, color: "oklch(0.3 0.06 255)", description: "Azul-marinho canelado, alças finas, sobreposição na altura do busto, calça longa." }),
  p({ id: "11", slug: "blusinha-elanova-amarelo-neon", name: "Blusinha Elanova", brand: "Elanova", category: "blusas", size: "P", condition: USED, price: 1290, color: "oklch(0.92 0.18 105)", description: "Amarelo-neon, mangas curtas levemente bufantes, gola redonda." }),
  p({ id: "12", slug: "cropped-lilimoon-good-vibes", name: "Cropped Lilimoon Good Vibes", brand: "Lilimoon", category: "croppeds", size: "P", condition: USED, price: 990, color: "oklch(0.87 0.07 55)", description: "Cor pêssego, mini margarida na frente e estampa maior de margarida com o texto GOOD VIBES nas costas." }),
  p({ id: "13", slug: "vestido-502-mix-animal-print", name: "Vestido 502 MIX", brand: "502 MIX", category: "vestidos", size: "P", condition: "Usado, em excelente estado", price: 1590, color: "oklch(0.45 0.005 250)", description: "Animal print preto e cinza, tomara que caia, detalhe estruturado no busto, saia efeito meio balão acima do joelho." }),
];

export const formatBRL = (cents: number) =>
  (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const STORE_RULES = [
  "Peças únicas: cada item possui apenas uma unidade disponível.",
  "Não trabalhamos com condicional: não enviamos peças para experimentação sem compromisso de compra.",
  "Escolheu a peça? Confirme a compra antes de finalizarmos o atendimento.",
  "Pedidos e combinações exclusivamente pelo Instagram Direct (não WhatsApp).",
];
export const RULES_INTRO = "Clientes amigas, devido aos inúmeros pedidos nas mesmas peças, precisamos estabelecer algumas regrinhas para organizar nossas vendas e garantir agilidade e respeito a todas.";