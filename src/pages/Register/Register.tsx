"use client";

import React from "react";
import { UserRegisterForm } from "./Form/Form";
import "./Register.css";

export const RegisterPage: React.FC = () => {
  return (
    <div className="register-user-page">
      <main className="register-user-page__main">
        <div className="register-user-page__content">
          <UserRegisterForm />
        </div>
      </main>
    </div>
  );
};
