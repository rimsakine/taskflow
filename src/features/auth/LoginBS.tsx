import React, { useState } from "react";
import { Container, Card, Form, Button, Alert } from "react-bootstrap";

import { useAuth } from "./AuthContext";
import api from "../../api/axios";

export default function LoginBS() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { state, dispatch } = useAuth();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    dispatch({ type: "LOGIN_START" });

    try {
      const { data: users } = await api.get(`/users?email=${email}`);

      if (users.length === 0 || users[0].password !== password) {
        dispatch({
          type: "LOGIN_FAILURE",
          payload: "Email ou mot de passe incorrect",
        });
        return;
      }

      const { password: _, ...user } = users[0];
      dispatch({ type: "LOGIN_SUCCESS", payload: user });
    } catch {
      dispatch({ type: "LOGIN_FAILURE", payload: "Erreur serveur" });
    }
  }

  return (
    <Container
      className="d-flex justify-content-center align-items-center"
      style={{ height: "100vh" }}
    >
      <Card style={{ maxWidth: 400, width: "100%" }}>
        <Card.Body>
          <Card.Title className="text-center mb-4" style={{ color: "#1B8C3E" }}>
            TaskFlow
          </Card.Title>

          {/* Affichage de l'alerte si une erreur existe dans state */}
          {state.error && <Alert variant="danger">{state.error}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Control
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)} // Indispensable
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Control
                type="password"
                placeholder="Mot de passe"
                value={password} // Indispensable
                onChange={(e) => setPassword(e.target.value)} // Indispensable
                required
              />
            </Form.Group>

            <Button
              type="submit"
              className="w-100"
              variant="success" // Pour avoir le bouton vert Bootstrap
              disabled={state.loading} // Désactive pendant le chargement
            >
              {state.loading ? "Connexion en cours..." : "Se connecter"}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}
