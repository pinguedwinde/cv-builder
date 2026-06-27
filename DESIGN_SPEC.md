# Plan : Refonte Design du CV Builder

## Contexte

L'application CV Builder dispose d'une base technique solide (Next.js 16, React 19, Radix UI, Tailwind v4, Framer Motion installé mais inutilisé, 5 thèmes CV). L'interface est fonctionnelle mais visuellement terne : couleurs plates, animations absentes, sélecteur de thème en `<select>` natif, header dupliqué sur chaque page, thèmes CV améliorables. L'objectif est une refonte design complète : app plus vivante et moderne, thèmes CV enrichis et 6 nouveaux thèmes professionnels.

---

## Phase 1 : Modernisation de l'UI de l'application

### 1.1 Enrichissement CSS (`src/app/globals.css`)

Ajouter sans casser les tokens existants :
- Intensifier `--primary`: `oklch(0.52 0.26 264)` (plus vibrant)
- Nouveau `--primary-glow`: `oklch(0.52 0.26 264 / 0.15)` (pour les lueurs)
- Nouveau `--success`: `oklch(0.68 0.18 150)` (vert pour les scores)
- Séparer davantage `--background` et `--card` en mode dark pour plus de profondeur
- Ajouter dans `@layer utilities` :
  - `.text-gradient-primary` (gradient clip sur le texte)
  - `.glass` (backdrop-filter blur + border semi-transparent)
  - `.card-hover` (translateY + shadow sur hover)
  - `.bg-hero-gradient` (radial gradient subtil en haut de page)
- Ajouter `::selection` avec couleur primaire à faible opacité
- Bridger les nouveaux tokens dans `@theme inline`

### 1.2 Composant Navbar partagé (`src/components/Navbar.tsx`)

Nouveau composant `"use client"` avec :
- Props : `title?`, `actions?: ReactNode`, `showBack?: boolean`, `backHref?: string`
- Style : `sticky top-0 z-50 glass border-b` (glassmorphisme)
- Logo : icône `FileText` dans un carré `bg-primary/10 text-primary` + texte "CV Builder"
- Animation d'entrée : `motion.header` avec `initial={{ y: -20, opacity: 0 }}` → `animate={{ y: 0, opacity: 1 }}`
- Remplace les `<header>` inline dans `page.tsx`, `editor/[id]/page.tsx`, `review/[id]/page.tsx`, `match/[id]/page.tsx`

### 1.3 ThemeToggle animé (`src/components/ThemeToggle.tsx`)

Remplacer le swap CSS `dark:hidden` par `AnimatePresence mode="wait"` avec `motion.div` keyé sur le thème :
```tsx
<motion.div key={theme} initial={{ rotate: -30, opacity: 0, scale: 0.7 }}
  animate={{ rotate: 0, opacity: 1, scale: 1 }} exit={{ rotate: 30, opacity: 0, scale: 0.7 }}
  transition={{ duration: 0.2 }} />
```

### 1.4 Page d'accueil (`src/app/page.tsx` ou `HomePageClient.tsx`)

- **Hero section** : titre avec `.text-gradient-primary`, sous-titre, `.bg-hero-gradient`, animations `motion.h2/p` avec delay
- **Grille de cartes animée** : `motion.div` container avec `staggerChildren: 0.08`, cartes individuelles avec variant `{ hidden: { opacity:0, y:24 }, visible: { opacity:1, y:0 } }`
- **Amélioration des cartes CV** : barre colorée `border-t-4` selon le thème (mapping `themeId` → couleur), `card-hover`, `whileTap={{ scale: 0.98 }}`
- **Empty state** : icône pulsante dans des cercles concentriques `animate-pulse`, 2 boutons (Créer / Importer)
- **Panel import** : `AnimatePresence` sur `height: 0 → "auto"` pour slide-down

### 1.5 Page éditeur (`src/app/editor/[id]/page.tsx`)

- Remplacer l'en-tête inline par `<Navbar showBack backHref="/" title={title} actions={<EditorActions />} />`
- Consolider les 6 boutons export en `DropdownMenu` (JSON / YAML / MD / PDF) déjà installé avec `@radix-ui/react-dropdown-menu`
- Cards de section : `bg-card`, `border-l-4 border-l-primary/40`, `shadow-sm`
- Transitions d'onglets : `AnimatePresence mode="wait"` sur un `motion.div` keyé sur l'onglet actif
- Toast flottant de sauvegarde : `AnimatePresence` + `motion.div` fixé en bas à droite avec `animate-spin` sur l'icône
- Skeleton de chargement : spinner CSS pur au lieu de la chaîne "Chargement..."

### 1.6 PreviewPanel (`src/components/preview/PreviewPanel.tsx`)

- **Sélecteur de thème visuel** : remplacer `<select>` par des chips horizontaux avec une pillule active animée via `motion.span layoutId="activeTheme"` (Shared Layout Framer Motion)
  ```tsx
  const themeAccents = { classic: "bg-slate-700", modern: "bg-blue-500", ... }
  ```
- **Zoom animé** : ajouter `transition: "transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)"` inline sur le conteneur A4
- **Indicateur de zoom** : `motion.span` keyé sur la valeur de zoom avec pop d'entrée
- Barre d'outils : icônes `Minimize2/Maximize2` animées comme ThemeToggle, bouton PDF avec `Button` component

### 1.7 Utilitaire d'accessibilité animations (`src/lib/motion.ts`)

```ts
import { useReducedMotion } from "framer-motion";
export function useMotionConfig() {
  const reduce = useReducedMotion();
  return { transition: reduce ? { duration: 0 } : undefined, stagger: reduce ? 0 : 0.08 };
}
```
A consommer dans tous les composants qui utilisent stagger ou spring.

---

## Phase 2 : Amélioration des thèmes CV existants

### 2.1 Minimal (`src/themes/minimal.tsx`)
- Changer le séparateur de dates `—` en ` - ` (tiret court) dans `dateRange()`
- Remplacer le marqueur `—` du résumé par un `<hr>` stylé `{ border: "none", borderTop: "1px solid #000" }`
- Ajouter section `publications`
- Rendre `volunteer.highlights` avec les puces `→`

### 2.2 Classic (`src/themes/classic.tsx`)
- Ajouter support photo : cercle centré dans le header si `b.image` est renseigné
- Remplacer les `—` en `|` ou ` - ` dans la rangée de contacts
- Ajouter section `publications`

### 2.3 Creative (`src/themes/creative.tsx`)
- Corriger le positionnement de `timelineDot` : passer de `position: absolute` à une approche `display: flex` pour compatibilité PDF Playwright
- Unifier les couleurs des badges (un seul style `s.badge`)
- Ajouter section `publications`

---

## Phase 3 : 6 Nouveaux thèmes CV

Chaque thème suit le même pattern : fichier `.tsx` auto-suffisant, styles en objet `const s`, composant exporté nommé, sections gardées avec `array.length > 0`.

### 3.1 Executive (`src/themes/executive.tsx`)
- **Cible** : Cadres dirigeants, C-suite, consultants seniors
- **Palette** : Fond `#FAFAF8`, texte `#1C1C1E`, or champagne `#C9A84C`, beige `#F5EDD6`
- **Fonts** : `'Playfair Display', Georgia, serif` / `'Raleway', 'Gill Sans', sans-serif`
- **Layout** : 1 colonne, marges généreuses (72px), `borderLeft: "4px solid #1C1C1E"` pleine hauteur
- **Spécificités** : titres en `fontVariant: "small-caps"`, `letterSpacing: "2px"`, dates en or à droite, puces tiret `−` en or, résumé avec bordure gauche or 3px

### 3.2 Aurora (`src/themes/aurora.tsx`)
- **Cible** : Jeunes professionnels, startups, UX, product managers
- **Palette** : Gradient `#0F9688 → #6C63FF → #C026D3` (header), fond `#FFFFFF`, accent `#6C63FF`
- **Fonts** : `'Outfit', 'Inter', system-ui, sans-serif`
- **Layout** : 1 colonne, header gradient pleine largeur 120px, cartes à `borderTop: "3px solid #6C63FF"`
- **Spécificités** : contacts dans le header en pills blanches semi-transparentes, compétences en tag cloud `#EDE9FF`

### 3.3 Swiss (`src/themes/swiss.tsx`)
- **Cible** : Designers, architectes, directeurs artistiques
- **Palette** : Sidebar noire `#111111`, texte blanc, accent rouge `#D62828`, fond blanc
- **Fonts** : `'Barlow Condensed', 'Arial Narrow', Arial, sans-serif` (condensé) / `'Barlow', Arial` (corps)
- **Layout** : 2 colonnes (200px sidebar noire + flex blanc), coins droits partout
- **Spécificités** : nom en majuscules 48px weight 800, titres de sections en bandes rouges `backgroundColor: "#D62828" color: "#fff"`, compétences séparées par `/`

### 3.4 Neo (`src/themes/neo.tsx`)
- **Cible** : Développeurs, DevOps, ingénieurs, chercheurs en sécurité
- **Palette** : Fond `#0D1117`, surface `#161B22`, vert néon `#39D353`, cyan `#58A6FF`, texte `#C9D1D9`
- **Fonts** : `'JetBrains Mono', 'Fira Code', 'Consolas', monospace`
- **Layout** : 1 colonne sombre, header "terminal" avec barre de titre `#21262D` et 3 dots macOS (`#FF5F56`, `#FFBD2E`, `#27C93F`)
- **Spécificités** : `$ whoami` avant le nom, sections `## SECTION`, dates `[YYYY-MM .. YYYY-MM]`, compétences en faux JSON `{ key: "value" }`, séparateurs `─────`

### 3.5 Elegant (`src/themes/elegant.tsx`)
- **Cible** : RH, consultantes, professions juridiques, milieu du luxe
- **Palette** : Fond `#FFFBF8`, rose doré `#C7736A`, or `#B8922A`, blush `#F5E6E1`, texte `#2C2025`
- **Fonts** : `'Cormorant Garamond', Garamond, Georgia, serif` (nom/titres) / `'Lato', 'Helvetica Neue', sans-serif` (corps)
- **Layout** : 1 colonne, marges larges (72px), contenu centré ~500px
- **Spécificités** : nom en `fontWeight: 300` (ultra-light chic), ornement `─────── ◆ ───────` en rose doré, puces `·` rose doré, résumé en italique, niveaux de langue en `◉○` (5 niveaux)

### 3.6 Bold (`src/themes/bold.tsx`)
- **Cible** : Marketing, direction créative, publicité, stratégistes de marque
- **Palette** : Fond `#FFFFFF`, texte `#0A0A0A`, jaune électrique `#FFEB3B`
- **Fonts** : `'Bebas Neue', 'Impact', 'Arial Black', sans-serif` (titre/sections) / `'DM Sans', 'Inter', system-ui` (corps)
- **Layout** : 1 colonne, nom en 72px (réduire à 64px si overflow), `letterSpacing: "4px"`, `textTransform: "uppercase"`
- **Spécificités** : bandes noires/jaunes pleines largeur pour les titres de sections, dates en pills jaunes `borderRadius: "2px"`, highlights avec `borderLeft: "4px solid #FFEB3B"`, compétences en grille 2 colonnes

---

## Phase 4 : Intégration du registre de thèmes

### `src/themes/types.ts`
Étendre `ThemeId` :
```ts
export type ThemeId = "classic" | "modern" | "minimal" | "creative" | "compact"
  | "executive" | "aurora" | "swiss" | "neo" | "elegant" | "bold";
```

### `src/themes/index.ts`
Ajouter 6 imports + 6 entrées dans le record `themes` avec `id`, `name` (FR), `description` (FR), `preview`, `component`.

Le sélecteur de thème dans `PreviewPanel` itère `themeIds = Object.keys(themes)` : aucun changement dans ce fichier.

---

## Ordre d'implémentation recommandé

1. `globals.css` - tokens CSS et utilities (aucun risque, pur CSS)
2. `lib/motion.ts` - utilitaire d'accessibilité animations
3. `ThemeToggle.tsx` - composant isolé
4. `components/ui/button.tsx` - variante `gradient` + `active:scale-[0.98]`
5. `components/ui/card.tsx` - `rounded-xl` + `overflow-hidden`
6. `components/Navbar.tsx` - nouveau composant
7. `app/page.tsx` - page d'accueil (plus gros changement)
8. `components/preview/PreviewPanel.tsx` - sélecteur visuel + zoom
9. `app/editor/[id]/page.tsx` - dépend de Navbar
10. `app/review/[id]/page.tsx` + `app/match/[id]/page.tsx` - dépendent de Navbar
11. Corrections thèmes existants (minimal, classic, creative)
12. 6 nouveaux thèmes (dans l'ordre : executive, aurora, elegant, bold, swiss, neo)
13. `src/themes/types.ts` + `src/themes/index.ts` - enregistrement

---

## Vérification

- `npm run dev` puis naviguer vers `/` : vérifier animations staggered, cartes hover
- Créer ou ouvrir un CV dans l'éditeur : vérifier transitions onglets, toast de sauvegarde
- Dans le PreviewPanel : tester chaque thème avec la pill animée
- Exporter en PDF pour chaque nouveau thème : vérifier fonds sombres (`printBackground: true` déjà actif), polices de substitution, pas de débordement
- Vérifier `prefers-reduced-motion` : les animations doivent être désactivées
- Tester light/dark mode sur toutes les pages
