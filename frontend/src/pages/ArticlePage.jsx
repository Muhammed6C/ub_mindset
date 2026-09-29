import React from 'react';
import { useParams, Link } from 'react-router-dom';

const ARTICLES = {
  1: {
    title: 'Comment choisir son t-shirt technique ?',
    category: 'Guides & Conseils',
    views: 1247,
    content: [
      'Le t-shirt technique est bien plus qu\'un simple vêtement : c\'est un allié performance qui peut faire la différence lors de vos entraînements. Mais face aux nombreuses options disponibles, comment faire le bon choix ?',
      'Le tissu est le premier critère à considérer. Privilégiez les fibres respirantes et évacuant l\'humidité comme le polyester recyclé ou les mélanges techniques. Ces matériaux vous gardent au sec même pendant les efforts les plus intenses.',
      'La coupe est tout aussi importante. Un t-shirt trop serré limite vos mouvements, tandis qu\'un modèle trop lourd peut créer des frottements désagréables. Optez pour une coupe ajustée mais pas compressive, qui suit votre corps sans le contraindre.',
      'Enfin, les détails font la différence : coutures plates pour éviter les irritations, col renforcé pour maintenir sa forme, et traitement anti-odeurs pour rester frais plus longtemps.',
    ],
  },
  2: {
    title: 'Les tendances sportswear de la saison',
    category: 'Tendances',
    views: 2103,
    content: [
      'Le sportswear évolue constamment, mêlant performance et style pour créer des pièces aussi fonctionnelles qu\'élégantes. Cette saison, plusieurs tendances se démarquent.',
      'Les coupes oversize dominent, offrant un confort maximal tout en restant tendance. Les t-shirts amples, les sweats à capuche généreux et les pantalons larges sont les pièces maîtresses du vestiaire sportif moderne.',
      'Les couleurs neutres — beige, gris, blanc cassé, noir — restent incontournables, permettant des associations faciles et intemporelles. Elles se marient parfaitement avec des touches de couleur plus vives pour ceux qui souhaitent personnaliser leur look.',
      'Les matières techniques et durables sont également à l\'honneur, avec une préférence pour les fibres recyclées et les traitements respectueux de l\'environnement.',
    ],
  },
  3: {
    title: 'Entretenir ses vêtements techniques',
    category: 'Entretien',
    views: 892,
    content: [
      'Un entretien adapté est essentiel pour préserver la qualité et la durabilité de vos vêtements techniques. Voici nos recommandations pour garder vos pièces comme neuves.',
      'Lavez vos vêtements techniques à basse température (30°C maximum) pour préserver les fibres et les traitements techniques. Évitez le sèche-linge qui peut endommager les élastiques et les membranes imperméables.',
      'Utilisez une lessive douce, sans adoucissant, qui pourrait obstruer les pores des tissus respirants. L\'adoucissant forme un film sur les fibres qui réduit leur capacité à évacuer l\'humidité.',
      'Rangez vos vêtements à plat ou sur cintre pour éviter les déformations. Évitez la lumière directe du soleil qui peut décolorer les tissus et dégrader les élastiques.',
    ],
  },
  4: {
    title: 'Le guide du legging parfait',
    category: 'Guides & Conseils',
    views: 1567,
    content: [
      'Le legging est une pièce polyvalente qui mérite une attention particulière lors de son choix. Voici les critères à considérer pour trouver le modèle parfait.',
      'La hauteur de taille est cruciale : une taille haute offre un maintien optimal et un confort supérieur pendant l\'effort. Elle évite également les désagréments des leggings qui glissent pendant les squats ou les fentes.',
      'Le tissu doit être opaque, résistant et respirant. Évitez les matières trop fines qui deviennent transparentes en position accroupie. Un bon legging doit rester opaque dans toutes les positions.',
      'Les coutures plates et les zones de renfort au niveau de l\'entrejambe augmentent la durabilité et le confort. Vérifiez également la présence d\'une poche pratique pour les petits essentiels.',
    ],
  },
  5: {
    title: '5 façons de porter une veste oversize',
    category: 'Tendances',
    views: 1834,
    content: [
      'La veste oversize est une pièce incontournable du vestiaire streetwear. Voici cinq façons de l\'intégrer à vos tenues.',
      'Première option : associez-la à un jean slim et des sneakers pour un look équilibré entre volumes et ajustements. Cette silhouette contrastée met en valeur la coupe ample de la veste.',
      'Deuxième option : portez-la sur un hoodie pour un style streetwear assumé. Les superpositions de volumes créent une silhouette moderne et décontractée.',
      'Troisième option : ceinturez-la pour marquer la taille et créer une silhouette plus structurée. Cette technique transforme la veste en pièce quasi-tailor.',
      'Quatrième option : associez-la à un legging et des baskets pour un look sporty-chic parfait pour les journées actives.',
      'Cinquième option : portez-la ouverte sur un t-shirt simple pour un style effortless qui fonctionne en toute occasion.',
    ],
  },
  6: {
    title: 'Pourquoi le coton bio change tout',
    category: 'Entretien',
    views: 756,
    content: [
      'Le coton bio représente une alternative durable et responsable au coton conventionnel. Ses avantages vont bien au-delà de l\'aspect environnemental.',
      'Côté confort, le coton bio est souvent plus doux et plus respirant que son équivalent conventionnel. Les fibres, non traitées avec des produits chimiques agressifs, conservent leurs propriétés naturelles.',
      'Côté durabilité, le coton bio est généralement plus résistant. Les fibres plus longues et moins fragilisées par les traitements chimiques offrent une meilleure tenue dans le temps.',
      'Côté environnemental, la culture du coton bio utilise jusqu\'à 91% moins d\'eau que le coton conventionnel et n\'utilise pas de pesticides ni d\'engrais chimiques de synthèse.',
    ],
  },
  7: {
    title: 'Sweat ou hoodie : lequel choisir ?',
    category: 'Guides & Conseils',
    views: 1123,
    content: [
      'Sweat et hoodie sont deux essentiels du vestiaire casual, mais ils répondent à des besoins différents. Voici comment les distinguer.',
      'Le sweat à col rond est plus polyvalent et plus facile à superposer. Il fonctionne aussi bien seul que sous une veste, et convient à un large éventail d\'occasions.',
      'La hoodie, avec sa capuche, offre une protection supplémentaire contre les éléments et un style plus affirmé. Elle est idéale pour les journées fraîches et les looks streetwear.',
      'En termes de coupe, les sweats ont tendance à être plus ajustés tandis que les hoodies sont souvent plus amples. Choisissez en fonction de votre style personnel et de l\'usage prévu.',
    ],
  },
  8: {
    title: 'Les couleurs qui domineront',
    category: 'Tendances',
    views: 2456,
    content: [
      'Les couleurs jouent un rôle crucial dans la composition d\'un vestiaire cohérent et intemporel. Voici les teintes à privilégier.',
      'Les tons neutres — beige, gris, blanc cassé, noir — forment la base idéale. Ils se marient facilement entre eux et avec presque toutes les autres couleurs.',
      'Les accents de couleur vive peuvent être ajoutés par petites touches : un accessoire, une paire de sneakers ou un t-shirt coloré suffisent à dynamiser une tenue.',
      'Les couleurs terre — terracotta, olive, camel — apportent chaleur et sophistication tout en restant faciles à associer.',
    ],
  },
  9: {
    title: 'Maximiser la durée de vie de vos sneakers',
    category: 'Entretien',
    views: 1678,
    content: [
      'Des sneakers bien entretenues peuvent durer des années. Voici nos conseils pour préserver vos paires préférées.',
      'Alternez vos sneakers pour leur laisser le temps de sécher complètement entre deux portés. L\'humidité résiduelle dégrade les matériaux et favorise les odeurs.',
      'Nettoyez-les régulièrement avec une brosse douce et un nettoyant adapté au matériau. Évitez le lavage en machine qui peut décoller les semelles et déformer les tissus.',
      'Utilisez des embauchoirs en bois pour maintenir la forme et absorber l\'humidité. Rangez-les dans un endroit sec et aéré, à l\'abri de la lumière directe.',
    ],
  },
};

export default function ArticlePage() {
  const { id } = useParams();
  const article = ARTICLES[Number(id)];

  if (!article) {
    return (
      <div
        style={{
          background: '#F2F1EF',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          paddingTop: '100px',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <p
            style={{
              fontFamily: '"Archivo Narrow", sans-serif',
              fontSize: '0.6rem',
              textTransform: 'uppercase',
              letterSpacing: '0.35em',
              color: '#8C8C8C',
              marginBottom: '16px',
            }}
          >
            ARTICLE INTROUVABLE
          </p>
          <Link
            to="/blog"
            style={{
              fontFamily: '"Archivo Narrow", sans-serif',
              fontWeight: 700,
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.25em',
              color: '#0A0A0A',
              textDecoration: 'none',
              borderBottom: '1px solid #0A0A0A',
              paddingBottom: '4px',
            }}
          >
            Retour au blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        background: '#F2F1EF',
        minHeight: '100vh',
        paddingTop: '100px',
      }}
    >
      <article
        style={{
          maxWidth: '800px',
          margin: '0 auto',
          padding: '0 28px 100px',
        }}
      >
        {/* Fil d'Ariane */}
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '40px',
            fontFamily: '"Archivo Narrow", sans-serif',
            fontSize: '0.6rem',
            textTransform: 'uppercase',
            letterSpacing: '0.2em',
            color: '#8C8C8C',
          }}
        >
          <Link
            to="/"
            style={{ color: '#8C8C8C', textDecoration: 'none' }}
          >
            Accueil
          </Link>
          <span>/</span>
          <Link
            to="/blog"
            style={{ color: '#8C8C8C', textDecoration: 'none' }}
          >
            Blog
          </Link>
          <span>/</span>
          <span style={{ color: '#0A0A0A' }}>{article.category}</span>
        </nav>

        {/* En-tête article */}
        <header style={{ marginBottom: '48px' }}>
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
            {article.category}
          </p>
          <h1
            style={{
              fontFamily: '"Archivo", sans-serif',
              fontWeight: 900,
              textTransform: 'uppercase',
              fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)',
              lineHeight: '1.1',
              letterSpacing: '-0.01em',
              color: '#0A0A0A',
              margin: '0 0 20px',
            }}
          >
            {article.title}
          </h1>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              fontFamily: '"Archivo Narrow", sans-serif',
              fontSize: '0.65rem',
              color: '#8C8C8C',
              letterSpacing: '0.1em',
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
              {article.views.toLocaleString('fr-FR')} vues
            </span>
          </div>
        </header>

        {/* Image hero */}
        <div
          style={{
            width: '100%',
            aspectRatio: '16 / 9',
            background: 'linear-gradient(155deg, #E8E7E3 0%, #DDDDD9 50%, #D5D4D0 100%)',
            marginBottom: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#8C8C8C" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
          </svg>
        </div>

        {/* Contenu */}
        <div
          style={{
            fontFamily: '"Archivo Narrow", sans-serif',
            fontSize: '0.95rem',
            lineHeight: '1.9',
            color: '#3A3A3A',
          }}
        >
          {article.content.map((paragraph, i) => (
            <p key={i} style={{ margin: '0 0 24px' }}>
              {paragraph}
            </p>
          ))}
        </div>

        {/* Bouton retour */}
        <div
          style={{
            marginTop: '60px',
            paddingTop: '32px',
            borderTop: '1px solid #D9D8D5',
          }}
        >
          <Link
            to="/blog"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              fontFamily: '"Archivo Narrow", sans-serif',
              fontWeight: 700,
              fontSize: '0.7rem',
              textTransform: 'uppercase',
              letterSpacing: '0.25em',
              color: '#0A0A0A',
              textDecoration: 'none',
              borderBottom: '1px solid #0A0A0A',
              paddingBottom: '4px',
              transition: 'opacity 0.2s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.6')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            <svg width="16" height="8" viewBox="0 0 18 7" fill="none">
              <path d="M18 3.5H2M5 1L1.5 3.5L5 6" stroke="#0A0A0A" strokeWidth="0.85"/>
            </svg>
            Retour au blog
          </Link>
        </div>
      </article>
    </div>
  );
}
