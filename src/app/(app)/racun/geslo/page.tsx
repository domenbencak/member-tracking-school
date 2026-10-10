import { Card } from "@/components/ui/card";
import { ChangePasswordForm } from "@/components/change-password-form";

export default function PasswordPage() { return <><div className="page-header"><div><h1 className="page-title">Sprememba gesla</h1><p className="page-description">Po spremembi se boste ponovno prijavili</p></div></div><Card><ChangePasswordForm /></Card></>; }
