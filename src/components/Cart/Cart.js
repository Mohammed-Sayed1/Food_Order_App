import React, { useContext, useState } from "react";
import Modal from "../UI/Modal";
import CartContext from "../../store/cart-context";
import CartItem from "./CartItem";
import Checkout from "./Checkout";

import classes from "./Cart.module.css";

const Cart = (props) => {
  const [isCheckout, setIsCheckout] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [didSubmit, setDidSubmit] = useState(false);
  const [didNotSubmit, setDidNotSubmit] = useState();

  const cartCtx = useContext(CartContext);
  const totalAmount = `$${cartCtx.totalAmount.toFixed(2)}`;
  const hasItems = cartCtx.items.length > 0;

  const cartItemRemoveHandler = (id) => {
    cartCtx.removeItem(id);
  };
  const cartItemAddHandler = (item) => {
    cartCtx.addItem({ ...item, amount: 1 });
  };

  const orderHandler = () => {
    setIsCheckout(true);
  };

  const submitOrderHandler = async (userData) => {
    try {
      setIsSubmitting(true);

      const response = await fetch(
        "https://react-http-66d50-default-rtdb.firebaseio.com/orders.json",
        {
          method: "POST",
          body: JSON.stringify({
            user: userData,
            orderItems: cartCtx.items,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Submitting failed!");
      }

      setIsSubmitting(false);
      setDidSubmit(true);
      cartCtx.clearCart();
    } catch (error) {
      setIsSubmitting(false);
      setDidNotSubmit(error.message);
    }
  };

  const cartItem = (
    <ul className={classes["cart-items"]}>
      {cartCtx.items.map((item) => (
        <CartItem
          key={item.id}
          name={item.name}
          amount={item.amount}
          price={item.price}
          onRemove={cartItemRemoveHandler.bind(null, item.id)}
          onAdd={cartItemAddHandler.bind(null, item)}
        />
      ))}
    </ul>
  );

  const modalAction = (
    <div className={classes.actions}>
      <button className={classes["button--alt"]} onClick={props.onClose}>
        Close
      </button>
      {hasItems && (
        <button className={classes.button} onClick={orderHandler}>
          Order
        </button>
      )}
    </div>
  );

  const cartModalContent = (
    <React.Fragment>
      {cartItem}
      <div className={classes.total}>
        <span>Total Amount</span>
        <span>{totalAmount}</span>
      </div>

      {isCheckout && (
        <Checkout onConfirm={submitOrderHandler} onCancel={props.onClose} />
      )}

      {!isCheckout && modalAction}
    </React.Fragment>
  );

  const isSubmittingModalContent = <p>Sending order data...</p>

  const didSubmitModalcontent = (
    <React.Fragment>
      <p className={classes.success}>Successfully sent the order!</p>
      <div className={classes.actions}>
        <button className={classes["button-success"]} onClick={props.onClose}>
          Close
        </button>
      </div>
    </React.Fragment>
  );

  const didNotSubmitModalcontent = (
    <React.Fragment>
      <p className={classes.failed}>{didNotSubmit}</p>
      <div className={classes.actions}>
        <button className={classes["button-failed"]} onClick={props.onClose}>
          Close
        </button>
      </div>
    </React.Fragment>
  );

  return (
    <Modal onClose={props.onClose}>
      {!isSubmitting && !didSubmit && !didNotSubmit && cartModalContent}
      {isSubmitting &&
        !didNotSubmit &&
        !didNotSubmit &&
        isSubmittingModalContent}
      {!isSubmitting && didSubmit && !didNotSubmit && didSubmitModalcontent}
      {!isSubmitting && didNotSubmit && !didSubmit && didNotSubmitModalcontent}
    </Modal>
  );
};

export default Cart;
