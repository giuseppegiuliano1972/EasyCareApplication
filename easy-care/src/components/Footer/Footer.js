// Filename - components/footer.js

import React, {useContext} from "react";
import {Container, Row, Col, Stack, Image, Nav, NavLink} from 'react-bootstrap'
import  "./footer.module.css";
import { MessageContext } from "../../context/MessageContext";

const Footer = () => {
  const { message } = useContext(MessageContext);

  return (
    <footer className="footer">
        <p>{message || "Nessun messaggio"}</p>
    </footer>
  );
};
export default Footer;