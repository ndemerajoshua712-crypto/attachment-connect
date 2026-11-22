import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { ArrowRight, BriefcaseBusiness, CheckCircle2, GraduationCap, LockKeyhole, Mail } from "lucide-react";
import { apiRequest } from "../api";
import { useAuth } from "../context/AuthContext";

const roleRoutes={STUDENT:"/student",COMPANY:"/company",ADMIN:"/admin"};
const initialDetails={firstName:"",lastName:"",university:"",programme:"",studyYear:"1",companyName:"",industry:"",city:"",registrationNumber:""};

export default function Login(){
 const {user,login}=useAuth();const navigate=useNavigate();const [registering,setRegistering]=useState(false);const [role,setRole]=useState("STUDENT");const [email,setEmail]=useState("");const [password,setPassword]=useState("");const [details,setDetails]=useState(initialDetails);const [error,setError]=useState("");const [submitting,setSubmitting]=useState(false);
 if(user)return <Navigate to={roleRoutes[user.role]||"/"} replace/>;
 function update(key,value){setDetails(current=>({...current,[key]:value}));}
 async function handleLogin(event){event.preventDefault();setError("");setSubmitting(true);try{const account=await login(email.trim(),password);navigate(roleRoutes[account.role]||"/",{replace:true});}catch(e){setError(e.message||"Unable to sign in.");}finally{setSubmitting(false);}}
 async function handleRegister(event){event.preventDefault();setError("");setSubmitting(true);
  try{
   const payload=role==="STUDENT"?{firstName:details.firstName.trim(),lastName:details.lastName.trim(),university:details.university.trim(),programme:details.programme.trim(),studyYear:Number(details.studyYear),email:email.trim().toLowerCase(),password}:{companyName:details.companyName.trim(),industry:details.industry.trim(),city:details.city.trim(),registrationNumber:details.registrationNumber.trim()||undefined,email:email.trim().toLowerCase(),password};
   const result=await apiRequest(`/auth/register/${role.toLowerCase()}`,{method:"POST",body:JSON.stringify(payload)});
   await login(payload.email,password);
   navigate(roleRoutes[role],{replace:true,state:{welcome:role==="COMPANY"?"Your company account is ready. It will be reviewed before you can publish opportunities.":result.message}});
  }catch(e){setError(e.message||"Unable to create your account.");}finally{setSubmitting(false);}
 }
 function toggleMode(){setRegistering(value=>!value);setError("");}
 return <main className="auth-page">
  <section className="auth-layout">
   <aside className="auth-aside"><div className="auth-brand"><div className="brand-icon"><GraduationCap size={25}/></div><div><h1>Attachment<span>Connect</span></h1><p>Opportunity starts here.</p></div></div><div className="auth-pitch"><p className="auth-kicker">A clearer path to experience</p><h2>Make your next step count.</h2><p>Find meaningful attachment opportunities and build the experience that moves your career forward.</p><ul><li><CheckCircle2 size={18}/>Discover verified opportunities</li><li><CheckCircle2 size={18}/>Keep applications in one place</li><li><CheckCircle2 size={18}/>Connect with trusted companies</li></ul></div><div className="auth-aside-foot">Built for students, companies, and the people who connect them.</div></aside>
   <section className="auth-panel"><div className="auth-card"><div className="auth-heading"><p className="auth-kicker">{registering?"GET STARTED":"YOUR WORKSPACE"}</p><h2>{registering?"Create your account":"Welcome back"}</h2><p>{registering?"Set up your account in a few quick steps.":"Sign in to continue to Attachment Connect."}</p></div>
    <form className="auth-form" onSubmit={registering?handleRegister:handleLogin}>
     {registering&&<><label htmlFor="accountRole">I’m joining as</label><div className="role-choice"><button type="button" className={role==="STUDENT"?"selected":""} onClick={()=>setRole("STUDENT")}><GraduationCap size={18}/>Student</button><button type="button" className={role==="COMPANY"?"selected":""} onClick={()=>setRole("COMPANY")}><BriefcaseBusiness size={18}/>Company</button></div>
      {role==="STUDENT"?<div className="auth-fields two-column"><div><label htmlFor="firstName">First name</label><input id="firstName" autoComplete="given-name" required minLength={2} maxLength={50} value={details.firstName} onChange={e=>update("firstName",e.target.value)}/></div><div><label htmlFor="lastName">Last name</label><input id="lastName" autoComplete="family-name" required minLength={2} maxLength={50} value={details.lastName} onChange={e=>update("lastName",e.target.value)}/></div><div className="wide"><label htmlFor="university">University</label><input id="university" autoComplete="organization" required minLength={2} maxLength={150} value={details.university} onChange={e=>update("university",e.target.value)}/></div><div><label htmlFor="programme">Programme of study</label><input id="programme" required minLength={2} maxLength={150} value={details.programme} onChange={e=>update("programme",e.target.value)}/></div><div><label htmlFor="studyYear">Year of study</label><select id="studyYear" value={details.studyYear} onChange={e=>update("studyYear",e.target.value)}>{[1,2,3,4,5,6,7,8].map(y=><option value={y} key={y}>Year {y}</option>)}</select></div></div>:<div className="auth-fields two-column"><div className="wide"><label htmlFor="companyName">Company name</label><input id="companyName" autoComplete="organization" required minLength={2} maxLength={150} value={details.companyName} onChange={e=>update("companyName",e.target.value)}/></div><div><label htmlFor="industry">Industry</label><input id="industry" required minLength={2} maxLength={100} value={details.industry} onChange={e=>update("industry",e.target.value)}/></div><div><label htmlFor="city">City</label><input id="city" required minLength={2} maxLength={100} value={details.city} onChange={e=>update("city",e.target.value)}/></div><div className="wide"><label htmlFor="registrationNumber">Registration number <span className="optional">Optional</span></label><input id="registrationNumber" maxLength={100} value={details.registrationNumber} onChange={e=>update("registrationNumber",e.target.value)}/></div></div>}
     </>}
     <div className="auth-fields"><div><label htmlFor="email">Email address</label><div className="auth-input"><Mail size={17}/><input id="email" type="email" autoComplete="email" required maxLength={255} value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/></div></div><div><label htmlFor="password">Password</label><div className="auth-input"><LockKeyhole size={17}/><input id="password" type="password" autoComplete={registering?"new-password":"current-password"} required minLength={registering?12:1} maxLength={128} value={password} onChange={e=>setPassword(e.target.value)} placeholder={registering?"At least 12 characters":"Your password"}/></div>{registering&&<small className="auth-hint">Use at least 12 characters.</small>}</div></div>
     {error&&<div className="auth-error" role="alert">{error}</div>}
     <button className="auth-submit" type="submit" disabled={submitting}>{submitting?(registering?"Creating account…":"Signing in…"):(registering?"Create account":"Sign in")}<ArrowRight size={18}/></button>
    </form>
    <p className="auth-switch">{registering?"Already have an account?":"New to Attachment Connect?"}<button type="button" onClick={toggleMode}>{registering?"Sign in":"Create an account"}</button></p>
   </div><p className="auth-panel-foot">Secure access to your Attachment Connect account.</p></section>
  </section>
 </main>
}
