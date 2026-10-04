import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './Cart.css';

export default function Cart() {
  const { cart, cartTotal, removeFromCart, updateQuantity } = useCart();
  return (
    <main className="cart-page">
      <header><p>UB MINDSET — PANIER</p><h1>TA SÉLECTION.</h1></header>
      {!cart.length ? <section className="cart-page__empty"><p>TON PANIER EST VIDE.</p><Link to="/catalog">DÉCOUVRIR LA COLLECTION</Link></section> : <><section className="cart-page__items" aria-label="Articles du panier">{cart.map((item) => <article key={item.key} className="cart-line"><img src={item.product.image} alt="" /><div><h2>{item.product.name}</h2><p>TAILLE {item.variant?.size || 'À CONFIRMER'} · {item.displayPrice}</p><div className="cart-line__quantity"><button type="button" aria-label={`Retirer un exemplaire de ${item.product.name}`} onClick={() => updateQuantity(item.key, item.quantity - 1)}>−</button><span>{item.quantity}</span><button type="button" aria-label={`Ajouter un exemplaire de ${item.product.name}`} onClick={() => updateQuantity(item.key, item.quantity + 1)}>+</button></div></div><button className="cart-line__remove" type="button" onClick={() => removeFromCart(item.key)} aria-label={`Supprimer ${item.product.name}`}>×</button></article>)}</section><footer className="cart-page__footer"><p><span>TOTAL</span><strong>{cartTotal.toFixed(0)} €</strong></p><Link to="/essayage">CRÉER MON AVATAR <span aria-hidden="true">→</span></Link></footer></>}
    </main>
  );
}
