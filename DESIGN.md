# Vibe Design System - Restaurante do Jânio

Baseado na metodologia moderna de "Vibe Design" (referência: Awesome Design MD) e alinhado com a estética de aplicativos de alta gastronomia e interfaces "Mobile-First Premium".

## 🎨 Paleta de Cores
A paleta prioriza o conforto visual, utilizando tons quentes e terrosos para o fundo, criando um contraste elegante com os componentes brancos e escuros.

- **Background Principal:** Creme Fosco (`#F4F2EE` ou `bg-stone-100` / `bg-[#F5F3F0]`)
- **Superfícies (Cards):** Branco Puro (`#FFFFFF`)
- **Acentos e Destaques:** Laranja Suave / Terra (`#E87B51` ou `orange-500`)
- **Navegação e Botões Primários:** Preto/Cinza Escuro (`#1A1A1A` ou `zinc-900`)
- **Texto Principal:** Quase Preto (`text-zinc-800`)
- **Texto Secundário:** Cinza Médio (`text-zinc-500`)
- **Estados Desabilitados:** Cinza Claro e Opacidade Fosca

## 🔤 Tipografia
Tipografia marcante e moderna, priorizando a legibilidade.

- **Fonte Base:** Inter / Sistema Nativo (`font-sans`)
- **Títulos (H1, H2):** Pesados e bem definidos (`font-black`, `tracking-tight`)
- **Subtítulos/Categorias:** Letras maiúsculas, espaçadas (`uppercase tracking-wider font-bold text-xs`)

## 📐 Formas e Bordas (Border Radius)
Elementos extremamente arredondados para transmitir suavidade e modernidade.

- **Cards de Produto:** `rounded-[28px]` ou `rounded-3xl`
- **Botões e Cápsulas (Pills):** `rounded-full`
- **Cabeçalho/Containers Flutuantes:** `rounded-[32px]`

## 📦 Espaçamento e Layout
- Layout focado em "Ilhas" (Islands): Elementos flutuam sobre o fundo em vez de tocarem as bordas da tela.
- **Margens Globais:** `p-5` ou `p-6` para um respiro confortável.
- Espaçamento interno generoso nos cards.

## 🌈 Sombras (Shadows)
Sombras grandes, difusas e muito sutis, focadas em elevação sem sujar a tela.
- `shadow-[0_8px_30px_rgb(0,0,0,0.04)]`

## 🧩 Componentes Principais

### 1. Header Flutuante
Minimalista, sem fundo sólido que ocupe de ponta a ponta. Um card ou pill flutuante no topo.

### 2. Cards de Produtos
Brancos, totalmente arredondados, margem entre eles (não mais uma lista dividida por linhas).
Se esgotado: Aplica-se `opacity-50`, escala de cinza suave e uma badge "Indisponível" minimalista.

### 3. Contadores (Quantity Pills)
Formato de pílula (`rounded-full`), fundo levemente cinza, botões de + e - minimalistas e circulares integrados na pílula.

### 4. Bottom Navigation (Floating Pill)
Uma barra inferior escura (`bg-zinc-900`), flutuante, não encostada nas bordas, contendo os ícones em formato "outline" (linhas finas). O item ativo ou com notificação ganha destaque laranja.
