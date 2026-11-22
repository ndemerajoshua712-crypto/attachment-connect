
import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { GraduationCap, Mail, Lock, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [role, setRole] = useState("STUDENT");
  const [details, setDetails] = useState({firstName:"",lastName:"",university:"",programme:"",studyYear:1,companyName:"",industry:"",city:"",registrationNumber:""});
  const [notice, setNotice] = useState("");

  const roleRoutes = {
    STUDENT: "/student",
    COMPANY: "/company",
    ADMIN: "/admin",
  };

  if (user) {
    return (
      <Navigate
        to={roleRoutes[user.role] || "/"}
        replace
      />
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const loggedInUser = await login(email, password);

      navigate(roleRoutes[loggedInUser.role] || "/", {
        replace: true,
      });
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRegister(event) {
    event.preventDefault(); setError(""); setNotice(""); setSubmitting(true);
    try {
      const payload = role === "STUDENT"
        ? {email,password,...details,studyYear:Number(details.studyYear)}
        : {email,password,companyName:details.companyName,industry:details.industry,city:details.city,registrationNumber:details.registrationNumber||undefined};
      const result=await fetch(`http://localhost:5000/api/auth/register/${role.toLowerCase()}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});const data=await result.json();if(!result.ok)throw new Error(data.message||"Registration failed.");setNotice(`${data.message} Sign in to continue.`);setRegistering(false);
    } catch(err) {setError(err.message||"Registration failed.");} finally {setSubmitting(false);}
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="brand-icon">
            <GraduationCap size={30} />
          </div>
          <h1>Attachment<span>Connect</span></h1>
          <p>Connecting students to opportunity.</p>
        </div>

        <div className="auth-heading">
          <h2>{registering?"Create your account":"Welcome back"}</h2>
          <p>{registering?"Set up your Attachment Connect workspace.":"Sign in to access your workspace."}</p>
        </div>

        {registering&&<div className="profile-field"><label htmlFor="accountRole">Account type</label><select id="accountRole" value={role} onChange={e=>setRole(e.target.value)}><option value="STUDENT">Student</option><option value="COMPANY">Company</option></select></div>}
        <form onSubmit={registering?handleRegister:handleSubmit}>
          {registering&&role==="STUDENT"&&<><label htmlFor="firstName">First name</label><input id="firstName" required minLength="2" value={details.firstName} onChange={e=>setDetails({...details,firstName:e.target.value})}/><label htmlFor="lastName">Last name</label><input id="lastName" required minLength="2" value={details.lastName} onChange={e=>setDetails({...details,lastName:e.target.value})}/><label htmlFor="university">University</label><input id="university" required value={details.university} onChange={e=>setDetails({...details,university:e.target.value})}/><label htmlFor="programme">Programme</label><input id="programme" required value={details.programme} onChange={e=>setDetails({...details,programme:e.target.value})}/><label htmlFor="studyYear">Study year</label><select id="studyYear" value={details.studyYear} onChange={e=>setDetails({...details,studyYear:e.target.value})}>{[1,2,3,4,5,6,7,8].map(y=><option key={y}>{y}</option>)}</select></>}
          {registering&&role==="COMPANY"&&<><label htmlFor="companyName">Company name</label><input id="companyName" required minLength="2" value={details.companyName} onChange={e=>setDetails({...details,companyName:e.target.value})}/><label htmlFor="industry">Industry</label><input id="industry" required value={details.industry} onChange={e=>setDetails({...details,industry:e.target.value})}/><label htmlFor="city">City</label><input id="city" required value={details.city} onChange={e=>setDetails({...details,city:e.target.value})}/><label htmlFor="registrationNumber">Registration number (optional)</label><input id="registrationNumber" value={details.registrationNumber} onChange={e=>setDetails({...details,registrationNumber:e.target.value})}/></>}
          <label htmlFor="email">Email address</label>
          <div className="auth-input">
            <Mail size={18} />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <label htmlFor="password">Password</label>
          <div className="auth-input">
            <Lock size={18} />
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder={registering?"At least 12 characters":"Enter your password"}
              minLength={registering?12:undefined}
              required
            />
          </div>

          {error && (
            <div className="auth-error" role="alert">
              {error}
            </div>
          )}
          {notice&&<div className="profile-message profile-success" role="status">{notice}</div>}

          <button
            className="auth-submit"
            type="submit"
            disabled={submitting}
          >
            {submitting ? "Please wait…" : registering?"Create account":"Sign in"}
            {!submitting && <ArrowRight size={18} />}
          </button>
        </form>

        <button type="button" className="text-button auth-toggle" onClick={()=>{setRegistering(v=>!v);setError("");setNotice("");}}>{registering?"Already have an account? Sign in":"New here? Create an account"}</button>

        <p className="auth-footer">
          Secure access to your Attachment Connect account.
        </p>
      </div>
    </div>
  );
}

