
import { useEffect, useState } from "react";
import { UserRound, Save, RefreshCw } from "lucide-react";
import { apiRequest, apiAssetUrl } from "../api";

const emptyProfile = {
  firstName: "",
  lastName: "",
  phone: "",
  university: "",
  programme: "",
  studyYear: "1",
  city: "",
  bio: "",
  skills: [],
};

export default function StudentProfile() {
  const [profile, setProfile] = useState(emptyProfile);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [photo, setPhoto] = useState("");
  const [photoFile, setPhotoFile] = useState(null);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    setLoading(true);
    setError("");

    try {
      const data = await apiRequest("/students/me");

      setProfile({
        firstName: data.profile.firstName || "",
        lastName: data.profile.lastName || "",
        phone: data.profile.phone || "",
        university: data.profile.university || "",
        programme: data.profile.programme || "",
        studyYear: String(data.profile.studyYear || 1),
        city: data.profile.city || "",
        bio: data.profile.bio || "",
        skills: data.profile.skills || [],
      });

      setEmail(data.profile.user?.email || "");
      setPhoto(data.profile.profilePhoto || "");
    } catch (err) {
      setError(err.message || "Could not load your profile.");
    } finally {
      setLoading(false);
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setProfile((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    const updatedProfile = {
      firstName: profile.firstName.trim(),
      lastName: profile.lastName.trim(),
      phone: profile.phone.trim() || null,
      university: profile.university.trim(),
      programme: profile.programme.trim(),
      studyYear: Number(profile.studyYear),
      city: profile.city.trim() || null,
      bio: profile.bio.trim() || null,
      skills: Array.isArray(profile.skills)
        ? profile.skills
        : [],
    };

    try {
      const data = await apiRequest("/students/me", {
        method: "PUT",
        body: JSON.stringify(updatedProfile),
      });

      setProfile({
        ...data.profile,
        phone: data.profile.phone || "",
        city: data.profile.city || "",
        bio: data.profile.bio || "",
        studyYear: String(data.profile.studyYear),
      });

      setSuccess("Your profile has been updated successfully.");
    } catch (err) {
      setError(err.message || "Could not update your profile.");
    } finally {
      setSaving(false);
    }
  }

  function handleSkillsChange(event) {
    const skills = event.target.value
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);

    setProfile((current) => ({
      ...current,
      skills,
    }));
  }

  async function uploadPhoto(event) {
    event.preventDefault(); if (!photoFile) return;
    const body = new FormData(); body.append("photo", photoFile);
    try { const result = await apiRequest("/students/me/photo", { method: "POST", body }); setPhoto(result.profile.profilePhoto); setSuccess("Profile photo updated."); setError(""); }
    catch (err) { setError(err.message); }
  }

  if (loading) {
    return (
      <div className="content-card">
        <p>Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="portal-page">
      <section className="welcome-section">
        <div>
          <p className="eyebrow">STUDENT ACCOUNT</p>
          <h1>My Profile</h1>
          <p className="welcome-description">
            Manage your personal and academic information.
          </p>
        </div>
      </section>

      <section className="content-card profile-editor">
        <form className="photo-row" onSubmit={uploadPhoto}><img src={apiAssetUrl(photo)} alt="" onError={e=>{e.currentTarget.style.display="none"}}/><div><strong>Profile photo</strong><p>JPG, PNG or WebP · up to 5 MB</p></div><input type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>setPhotoFile(e.target.files?.[0]||null)}/><button className="profile-refresh" disabled={!photoFile}>Upload photo</button></form>
        <div className="card-heading">
          <div>
            <h2>
              <UserRound size={21} />
              Personal Information
            </h2>
            <p>Keep your information accurate and up to date.</p>
          </div>

          <button
            type="button"
            className="profile-refresh"
            onClick={loadProfile}
            disabled={saving}
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {error && (
          <div className="profile-message profile-error" role="alert">
            {error}
          </div>
        )}

        {success && (
          <div className="profile-message profile-success" role="status">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="profile-form-grid">
            <div className="profile-field">
              <label htmlFor="firstName">First name</label>
              <input
                id="firstName"
                name="firstName"
                value={profile.firstName}
                onChange={handleChange}
                required
                maxLength={60}
              />
            </div>

            <div className="profile-field">
              <label htmlFor="lastName">Last name</label>
              <input
                id="lastName"
                name="lastName"
                value={profile.lastName}
                onChange={handleChange}
                required
                maxLength={60}
              />
            </div>

            <div className="profile-field">
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                value={email}
                disabled
              />
              <small>Your registered email address.</small>
            </div>

            <div className="profile-field">
              <label htmlFor="phone">Phone number</label>
              <input
                id="phone"
                name="phone"
                value={profile.phone}
                onChange={handleChange}
                maxLength={25}
                placeholder="Your phone number"
              />
            </div>

            <div className="profile-field">
              <label htmlFor="university">University</label>
              <input
                id="university"
                name="university"
                value={profile.university}
                onChange={handleChange}
                required
                maxLength={120}
              />
            </div>

            <div className="profile-field">
              <label htmlFor="programme">Programme of study</label>
              <input
                id="programme"
                name="programme"
                value={profile.programme}
                onChange={handleChange}
                required
                maxLength={120}
              />
            </div>

            <div className="profile-field">
              <label htmlFor="studyYear">Year of study</label>
              <select
                id="studyYear"
                name="studyYear"
                value={profile.studyYear}
                onChange={handleChange}
                required
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((year) => (
                  <option key={year} value={year}>
                    Year {year}
                  </option>
                ))}
              </select>
            </div>

            <div className="profile-field">
              <label htmlFor="city">City</label>
              <input
                id="city"
                name="city"
                value={profile.city}
                onChange={handleChange}
                maxLength={80}
                placeholder="Your city"
              />
            </div>

            <div className="profile-field profile-full-width">
              <label htmlFor="skills">Skills</label>
              <input
                id="skills"
                value={profile.skills.join(", ")}
                onChange={handleSkillsChange}
                placeholder="Java, Python, Communication"
              />
              <small>Separate each skill with a comma. Maximum 30 skills.</small>
            </div>

            <div className="profile-field profile-full-width">
              <label htmlFor="bio">About me</label>
              <textarea
                id="bio"
                name="bio"
                value={profile.bio}
                onChange={handleChange}
                rows={5}
                maxLength={1000}
                placeholder="Write a short introduction about yourself..."
              />
            </div>
          </div>

          <div className="profile-form-actions">
            <button
              type="submit"
              className="profile-save"
              disabled={saving}
            >
              <Save size={17} />
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
