import React, { useState, useEffect } from 'react';

const CATEGORIES = [
  { label: 'Tous', slug: 'all' },
  { label: 'Guides & Conseils', slug: 'guides' },
  { label: 'Tendances', slug: 'tendances' },
  { label: 'Entretien', slug: 'entretien' },
];

const ARTICLES = [
  {
    id: 1,
    title: 'Comment choisir son t-shirt technique ?',
    category: 'Guides & Conseils',
    views: 1247,
    icon: 'tshirt',
    excerpt: 'Les critères essentiels pour sélectionner un t-shirt qui allie confort, performance et style au quotidien.',
    content: [
      'Le t-shirt technique est bien plus qu\'un simple vêtement : c\'est un allié performance qui peut faire la différence lors de vos entraînements. Mais face aux nombreuses options disponibles, comment faire le bon choix ?',
      'Le tissu est le premier critère à considérer. Privilégiez les fibres respirantes et évacuant l\'humidité comme le polyester recyclé ou les mélanges techniques. Ces matériaux vous gardent au sec même pendant les efforts les plus intenses.',
      'La coupe est tout aussi importante. Un t-shirt trop serré limite vos mouvements, tandis qu\'un modèle trop lourd peut créer des frottements désagréables. Optez pour une coupe ajustée mais pas compressive, qui suit votre corps sans le contraindre.',
      'Enfin, les détails font la différence : coutures plates pour éviter les irritations, col renforcé pour maintenir sa forme, et traitement anti-odeurs pour rester frais plus longtemps.',
    ],
  },
  {
    id: 2,
    title: 'Les tendances sportswear de la saison',
    category: 'Tendances',
    views: 2103,
    icon: 'sparkle',
    excerpt: 'Découvrez les coupes et couleurs qui dominent cette saison pour un look à la fois athlétique et urbain.',
    content: [
      'Le sportswear évolue constamment, mêlant performance et style pour créer des pièces aussi fonctionnelles qu\'élégantes. Cette saison, plusieurs tendances se démarquent.',
      'Les coupes oversize dominent, offrant un confort maximal tout en restant tendance. Les t-shirts amples, les sweats à capuche généreux et les pantalons larges sont les pièces maîtresses du vestiaire sportif moderne.',
      'Les couleurs neutres — beige, gris, blanc cassé, noir — restent incontournables, permettant des associations faciles et intemporelles. Elles se marient parfaitement avec des touches de couleur plus vives pour ceux qui souhaitent personnaliser leur look.',
      'Les matières techniques et durables sont également à l\'honneur, avec une préférence pour les fibres recyclées et les traitements respectueux de l\'environnement.',
    ],
  },
  {
    id: 3,
    title: 'Entretenir ses vêtements techniques',
    category: 'Entretien',
    views: 892,
    icon: 'care',
    excerpt: 'Lavage, séchage, rangement : les bons gestes pour préserver la qualité de vos pièces préférées.',
    content: [
      'Un entretien adapté est essentiel pour préserver la qualité et la durabilité de vos vêtements techniques. Voici nos recommandations pour garder vos pièces comme neuves.',
      'Lavez vos vêtements techniques à basse température (30°C maximum) pour préserver les fibres et les traitements techniques. Évitez le sèche-linge qui peut endommager les élastiques et les membranes imperméables.',
      'Utilisez une lessive douce, sans adoucissant, qui pourrait obstruer les pores des tissus respirants. L\'adoucissant forme un film sur les fibres qui réduit leur capacité à évacuer l\'humidité.',
      'Rangez vos vêtements à plat ou sur cintre pour éviter les déformations. Évitez la lumière directe du soleil qui peut décolorer les tissus et dégrader les élastiques.',
    ],
  },
  {
    id: 4,
    title: 'Le guide du legging parfait',
    category: 'Guides & Conseils',
    views: 1567,
    icon: 'pants',
    excerpt: 'Hauteur de taille, tissu, maintien : tout ce qu\'il faut savoir avant d\'investir dans un legging durable.',
    content: [
      'Le legging est une pièce polyvalente qui mérite une attention particulière lors de son choix. Voici les critères à considérer pour trouver le modèle parfait.',
      'La hauteur de taille est cruciale : une taille haute offre un maintien optimal et un confort supérieur pendant l\'effort. Elle évite également les désagréments des leggings qui glissent pendant les squats ou les fentes.',
      'Le tissu doit être opaque, résistant et respirant. Évitez les matières trop fines qui deviennent transparentes en position accroupie. Un bon legging doit rester opaque dans toutes les positions.',
      'Les coutures plates et les zones de renfort au niveau de l\'entrejambe augmentent la durabilité et le confort. Vérifiez également la présence d\'une poche pratique pour les petits essentiels.',
    ],
  },
  {
    id: 5,
    title: '5 façons de porter une veste oversize',
    category: 'Tendances',
    views: 1834,
    icon: 'jacket',
    excerpt: 'Du casual au streetwear, explorez les multiples possibilités offertes par cette pièce incontournable.',
    content: [
      'La veste oversize est une pièce incontournable du vestiaire streetwear. Voici cinq façons de l\'intégrer à vos tenues.',
      'Première option : associez-la à un jean slim et des sneakers pour un look équilibré entre volumes et ajustements. Cette silhouette contrastée met en valeur la coupe ample de la veste.',
      'Deuxième option : portez-la sur un hoodie pour un style streetwear assumé. Les superpositions de volumes créent une silhouette moderne et décontractée.',
      'Troisième option : ceinturez-la pour marquer la taille et créer une silhouette plus structurée. Cette technique transforme la veste en pièce quasi-tailor.',
      'Quatrième option : associez-la à un legging et des baskets pour un look sporty-chic parfait pour les journées actives.',
      'Cinquième option : portez-la ouverte sur un t-shirt simple pour un style effortless qui fonctionne en toute occasion.',
    ],
  },
  {
    id: 6,
    title: 'Pourquoi le coton bio change tout',
    category: 'Entretien',
    views: 756,
    icon: 'leaf',
    excerpt: 'Confort, durabilité, impact : découvrez les avantages du coton bio dans votre vestiaire sportif.',
    content: [
      'Le coton bio représente une alternative durable et responsable au coton conventionnel. Ses avantages vont bien au-delà de l\'aspect environnemental.',
      'Côté confort, le coton bio est souvent plus doux et plus respirant que son équivalent conventionnel. Les fibres, non traitées avec des produits chimiques agressifs, conservent leurs propriétés naturelles.',
      'Côté durabilité, le coton bio est généralement plus résistant. Les fibres plus longues et moins fragilisées par les traitements chimiques offrent une meilleure tenue dans le temps.',
      'Côté environnemental, la culture du coton bio utilise jusqu\'à 91% moins d\'eau que le coton conventionnel et n\'utilise pas de pesticides ni d\'engrais chimiques de synthèse.',
    ],
  },
  {
    id: 7,
    title: 'Sweat ou hoodie : lequel choisir ?',
    category: 'Guides & Conseils',
    views: 1123,
    icon: 'hoodie',
    excerpt: 'Coupe, usage, style : nous comparons ces deux essentiels pour vous aider à faire le bon choix.',
    content: [
      'Sweat et hoodie sont deux essentiels du vestiaire casual, mais ils répondent à des besoins différents. Voici comment les distinguer.',
      'Le sweat à col rond est plus polyvalent et plus facile à superposer. Il fonctionne aussi bien seul que sous une veste, et convient à un large éventail d\'occasions.',
      'La hoodie, avec sa capuche, offre une protection supplémentaire contre les éléments et un style plus affirmé. Elle est idéale pour les journées fraîches et les looks streetwear.',
      'En termes de coupe, les sweats ont tendance à être plus ajustés tandis que les hoodies sont souvent plus amples. Choisissez en fonction de votre style personnel et de l\'usage prévu.',
    ],
  },
  {
    id: 8,
    title: 'Les couleurs qui domineront',
    category: 'Tendances',
    views: 2456,
    icon: 'palette',
    excerpt: 'Tons neutres, accents vibrants : la palette de couleurs à adopter pour rester dans l\'air du temps.',
    content: [
      'Les couleurs jouent un rôle crucial dans la composition d\'un vestiaire cohérent et intemporel. Voici les teintes à privilégier.',
      'Les tons neutres — beige, gris, blanc cassé, noir — forment la base idéale. Ils se marient facilement entre eux et avec presque toutes les autres couleurs.',
      'Les accents de couleur vive peuvent être ajoutés par petites touches : un accessoire, une paire de sneakers ou un t-shirt coloré suffisent à dynamiser une tenue.',
      'Les couleurs terre — terracotta, olive, camel — apportent chaleur et sophistication tout en restant faciles à associer.',
    ],
  },
  {
    id: 9,
    title: 'Maximiser la durée de vie de vos sneakers',
    category: 'Entretien',
    views: 1678,
    icon: 'sparkles',
    excerpt: 'Protection, nettoyage, rotation : nos conseils pour garder vos sneakers comme neuves plus longtemps.',
    content: [
      'Des sneakers bien entretenues peuvent durer des années. Voici nos conseils pour préserver vos paires préférées.',
      'Alternez vos sneakers pour leur laisser le temps de sécher complètement entre deux portés. L\'humidité résiduelle dégrade les matériaux et favorise les odeurs.',
      'Nettoyez-les régulièrement avec une brosse douce et un nettoyant adapté au matériau. Évitez le lavage en machine qui peut décoller les semelles et déformer les tissus.',
      'Utilisez des embauchoirs en bois pour maintenir la forme et absorber l\'humidité. Rangez-les dans un endroit sec et aéré, à l\'abri de la lumière directe.',
    ],
  },
];

function ArticleIcon({ type }) {
  const common = {
    fill: 'none',
    stroke: '#8C8C8C',
    strokeWidth: '1.2',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  };
  switch (type) {
    case 'tshirt':
      return (
        <svg width="64" height="64" viewBox="0 0 24 24" {...common}>
          <path d="M6 3l-4 4 2 2 2-1v12h12V8l2 1 2-2-4-4-2 1a4 4 0 0 1-8 0l-2-1z"/>
        </svg>
      );
    case 'sparkle':
      return (
        <svg width="64" height="64" viewBox="0 0 24 24" {...common}>
          <path d="M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4z"/>
        </svg>
      );
    case 'care':
      return (
        <svg width="64" height="64" viewBox="0 0 24 24" {...common}>
          <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z"/>
          <path d="M12 6v6l4 2"/>
        </svg>
      );
    case 'pants':
      return (
        <svg width="64" height="64" viewBox="0 0 24 24" {...common}>
          <path d="M6 3h12l1 18h-5l-2-12-2 12H5L6 3z"/>
        </svg>
      );
    case 'jacket':
      return (
        <svg width="64" height="64" viewBox="0 0 24 24" {...common}>
          <path d="M8 3L3 7l2 2 1-1v13h12V8l1 1 2-2-5-4-2 1a5 5 0 0 1-6 0L8 3z"/>
          <line x1="12" y1="7" x2="12" y2="21"/>
        </svg>
      );
    case 'leaf':
      return (
        <svg width="64" height="64" viewBox="0 0 24 24" {...common}>
          <path d="M12 2C7 7 2 10 2 15a10 10 0 0 0 20 0c0-5-5-8-10-13z"/>
        </svg>
      );
    case 'hoodie':
      return (
        <svg width="64" height="64" viewBox="0 0 24 24" {...common}>
          <path d="M12 3a4 4 0 0 1 4 4l3 3-2 2-1-1v10H8V11l-1 1-2-2 3-3a4 4 0 0 1 4-4z"/>
        </svg>
      );
    case 'palette':
      return (
        <svg width="64" height="64" viewBox="0 0 24 24" {...common}>
          <circle cx="12" cy="12" r="10"/>
          <circle cx="8" cy="10" r="1" fill="#8C8C8C"/>
          <circle cx="12" cy="7.5" r="1" fill="#8C8C8C"/>
          <circle cx="16" cy="10" r="1" fill="#8C8C8C"/>
        </svg>
      );
    case 'sparkles':
      return (
        <svg width="64" height="64" viewBox="0 0 24 24" {...common}>
          <path d="M12 2l1.8 5.2L19 9l-5.2 1.8L12 16l-1.8-5.2L5 9l5.2-1.8z"/>
          <path d="M19 14l.9 2.6L22.5 17.5l-2.6.9L19 21l-.9-2.6-2.6-.9 2.6-.9z"/>
        </svg>
      );
    default:
      return null;
  }
}

export default function Blog() {
  const [selectedArticle, setSelectedArticle] = useState(null);

  /* Bloque le scroll du body quand la modal est ouverte */
  useEffect(() => {
    document.body.style.overflow = selectedArticle ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [selectedArticle]);

  return (
    <div
      style={{
        background: '#F2F1EF',
        minHeight: '100vh',
        paddingTop: '100px',
      }}
    >
      {/* ── EN-TÊTE ── */}
      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 28px 60px',
          textAlign: 'center',
        }}
      >
        <p
          style={{
            fontFamily: '"Archivo Narrow", sans-serif',
            fontWeight: 500,
            fontSize: '0.55rem',
            textTransform: 'uppercase',
            letterSpacing: '0.35em',
            color: '#8C8C8C',
            marginBottom: '16px',
          }}
        >
          LE BLOG
        </p>
        <h1
          style={{
            fontFamily: '"Archivo", sans-serif',
            fontWeight: 900,
            textTransform: 'uppercase',
            fontSize: 'clamp(2rem, 4vw, 3.5rem)',
            lineHeight: '1.05',
            letterSpacing: '-0.01em',
            color: '#0A0A0A',
            margin: '0 0 20px',
          }}
        >
          Conseils & Tendances
        </h1>
        <div
          style={{
            width: '32px',
            height: '2px',
            background: '#0A0A0A',
            margin: '0 auto 20px',
          }}
        />
        <p
          style={{
            fontFamily: '"Archivo Narrow", sans-serif',
            fontSize: '0.85rem',
            lineHeight: '1.7',
            color: '#6B6B6B',
            maxWidth: '480px',
            margin: '0 auto',
          }}
        >
          Guides d'entretien, tendances sportswear et conseils style pour
          composer un vestiaire durable et performant.
        </p>
      </div>

      {/* ── FILTRES CATÉGORIES ── */}
      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 28px 40px',
          display: 'flex',
          justifyContent: 'center',
          gap: '12px',
          flexWrap: 'wrap',
        }}
      >
        {CATEGORIES.map((cat) => (
          <button
            key={cat.slug}
            style={{
              fontFamily: '"Archivo Narrow", sans-serif',
              fontWeight: 600,
              fontSize: '0.65rem',
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              color: '#3A3A3A',
              background: 'transparent',
              border: '1px solid #D9D8D5',
              borderRadius: '2px',
              padding: '10px 20px',
              cursor: 'pointer',
              transition: 'all 0.25s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#0A0A0A';
              e.currentTarget.style.color = '#F2F1EF';
              e.currentTarget.style.borderColor = '#0A0A0A';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = '#3A3A3A';
              e.currentTarget.style.borderColor = '#D9D8D5';
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* ── GRILLE D'ARTICLES ── */}
      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 28px 100px',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '48px 32px',
        }}
      >
        {ARTICLES.map((article) => (
          <article
            key={article.id}
            style={{ cursor: 'pointer' }}
            onClick={() => setSelectedArticle(article)}
          >
            {/* Image placeholder */}
            <div
              style={{
                width: '100%',
                aspectRatio: '4 / 3',
                background: 'linear-gradient(155deg, #E8E7E3 0%, #DDDDD9 50%, #D5D4D0 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                marginBottom: '20px',
                position: 'relative',
              }}
            >
              <div
                style={{
                  transition: 'transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
                }}
                className="blog-card-icon"
              >
                <ArticleIcon type={article.icon} />
              </div>
              {/* Tag catégorie */}
              <span
                style={{
                  position: 'absolute',
                  top: '12px',
                  left: '12px',
                  fontFamily: '"Archivo Narrow", sans-serif',
                  fontWeight: 600,
                  fontSize: '0.5rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.2em',
                  color: '#0A0A0A',
                  background: 'rgba(242, 241, 239, 0.9)',
                  padding: '6px 12px',
                  borderRadius: '2px',
                }}
              >
                {article.category}
              </span>
            </div>

            {/* Infos article */}
            <div>
              <h2
                style={{
                  fontFamily: '"Archivo", sans-serif',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  lineHeight: '1.4',
                  color: '#0A0A0A',
                  margin: '0 0 10px',
                }}
              >
                {article.title}
              </h2>
              <p
                style={{
                  fontFamily: '"Archivo Narrow", sans-serif',
                  fontSize: '0.78rem',
                  lineHeight: '1.6',
                  color: '#6B6B6B',
                  margin: '0 0 14px',
                }}
              >
                {article.excerpt}
              </p>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontFamily: '"Archivo Narrow", sans-serif',
                  fontSize: '0.6rem',
                  color: '#8C8C8C',
                  letterSpacing: '0.1em',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8C8C8C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                {article.views.toLocaleString('fr-FR')} vues
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* ── PAGINATION ── */}
      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 28px 100px',
          display: 'flex',
          justifyContent: 'center',
          gap: '8px',
        }}
      >
        {[1, 2, 3, 4, 5].map((page) => (
          <button
            key={page}
            style={{
              fontFamily: '"Archivo Narrow", sans-serif',
              fontWeight: 600,
              fontSize: '0.7rem',
              color: page === 1 ? '#F2F1EF' : '#3A3A3A',
              background: page === 1 ? '#0A0A0A' : 'transparent',
              border: `1px solid ${page === 1 ? '#0A0A0A' : '#D9D8D5'}`,
              borderRadius: '2px',
              width: '40px',
              height: '40px',
              cursor: 'pointer',
              transition: 'all 0.25s ease',
            }}
            onMouseEnter={(e) => {
              if (page !== 1) {
                e.currentTarget.style.background = '#0A0A0A';
                e.currentTarget.style.color = '#F2F1EF';
                e.currentTarget.style.borderColor = '#0A0A0A';
              }
            }}
            onMouseLeave={(e) => {
              if (page !== 1) {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#3A3A3A';
                e.currentTarget.style.borderColor = '#D9D8D5';
              }
            }}
          >
            {page}
          </button>
        ))}
      </div>

      {/* ── MODAL ARTICLE ── */}
      {selectedArticle && (
        <div
          onClick={() => setSelectedArticle(null)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            background: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            opacity: 1,
            transition: 'opacity 0.3s ease',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '720px',
              maxHeight: '90vh',
              overflowY: 'auto',
              background: '#FFFFFF',
              borderRadius: '4px',
              boxShadow: '0 24px 64px rgba(0, 0, 0, 0.2)',
              position: 'relative',
            }}
          >
            {/* Bouton fermer */}
            <button
              onClick={() => setSelectedArticle(null)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                zIndex: 10,
                background: 'rgba(242, 241, 239, 0.9)',
                border: 'none',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'background 0.2s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#E8E7E3')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(242, 241, 239, 0.9)')}
              aria-label="Fermer"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0A0A0A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>

            {/* En-tête modal */}
            <div style={{ padding: '40px 40px 0' }}>
              <p
                style={{
                  fontFamily: '"Archivo Narrow", sans-serif',
                  fontWeight: 500,
                  fontSize: '0.55rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.35em',
                  color: '#8C8C8C',
                  marginBottom: '12px',
                }}
              >
                {selectedArticle.category}
              </p>
              <h2
                style={{
                  fontFamily: '"Archivo", sans-serif',
                  fontWeight: 900,
                  textTransform: 'uppercase',
                  fontSize: 'clamp(1.4rem, 3vw, 2rem)',
                  lineHeight: '1.15',
                  letterSpacing: '-0.01em',
                  color: '#0A0A0A',
                  margin: '0 0 16px',
                  paddingRight: '40px',
                }}
              >
                {selectedArticle.title}
              </h2>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  fontFamily: '"Archivo Narrow", sans-serif',
                  fontSize: '0.65rem',
                  color: '#8C8C8C',
                  letterSpacing: '0.1em',
                  marginBottom: '32px',
                }}
              >
                <span>UB Mindset</span>
                <span>·</span>
                <span>5 min de lecture</span>
                <span>·</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8C8C8C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                  {selectedArticle.views.toLocaleString('fr-FR')} vues
                </span>
              </div>
            </div>

            {/* Image hero */}
            <div
              style={{
                width: '100%',
                aspectRatio: '16 / 9',
                background: 'linear-gradient(155deg, #E8E7E3 0%, #DDDDD9 50%, #D5D4D0 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '32px',
              }}
            >
              <ArticleIcon type={selectedArticle.icon} />
            </div>

            {/* Contenu */}
            <div
              style={{
                padding: '0 40px 40px',
                fontFamily: '"Archivo Narrow", sans-serif',
                fontSize: '0.9rem',
                lineHeight: '1.9',
                color: '#3A3A3A',
              }}
            >
              {selectedArticle.content.map((paragraph, i) => (
                <p key={i} style={{ margin: '0 0 20px' }}>
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .blog-card-icon {
          transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
        }
        article:hover .blog-card-icon {
          transform: scale(1.08);
        }

        @media (max-width: 1024px) {
          div[style*="grid-template-columns: repeat(3, 1fr)"] {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }

        @media (max-width: 768px) {
          div[style*="grid-template-columns: repeat(3, 1fr)"] {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
        }
      `}</style>
    </div>
  );
}
