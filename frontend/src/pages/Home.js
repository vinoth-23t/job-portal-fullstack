import Navbar from "../components/Navbar";
import "./Home.css";
import { useNavigate } from "react-router-dom";

function Home() {
    const navigate = useNavigate();

    return (
        <>
            <Navbar />

            {/* HERO SECTION */}

            <section className="hero-section">

                <div className="hero-content">

                    <h1>
                        Find Your Dream Job
                    </h1>

                    <p>
                        Explore jobs from top companies
                        and apply easily.
                    </p>

                    <button
                        onClick={() => navigate("/jobs")}
                    >
                        Explore Jobs
                    </button>

                </div>

            </section>

            {/* FEATURES SECTION */}

            <section className="features-section">

                <div className="feature-card">

                    <h2>1000+ Jobs</h2>

                    <p>
                        Find jobs across multiple domains.
                    </p>

                </div>

                <div className="feature-card">

                    <h2>Top Companies</h2>

                    <p>
                        Apply to trusted recruiters.
                    </p>

                </div>

                <div className="feature-card">

                    <h2>Easy Apply</h2>

                    <p>
                        Apply for jobs with one click.
                    </p>

                </div>

            </section>

            {/* ABOUT SECTION */}

            <section className="about-section">

                <div className="about-content">

                    <h1>
                        Why Choose JobPortal?
                    </h1>

                    <p>
                        Our platform connects talented
                        candidates with trusted companies.
                        Recruiters can easily post jobs and
                        candidates can apply instantly.
                    </p>

                </div>

            </section>

            {/* JOB CATEGORIES */}

            <section className="category-section">

                <h1>Popular Categories</h1>

                <div className="category-grid">

                    <div className="category-card">
                        Software Developer
                    </div>

                    <div className="category-card">
                        Data Analyst
                    </div>

                    <div className="category-card">
                        UI/UX Designer
                    </div>

                    <div className="category-card">
                        Digital Marketing
                    </div>

                    <div className="category-card">
                        Cloud Engineer
                    </div>

                    <div className="category-card">
                        HR Recruiter
                    </div>

                </div>

            </section>

            {/* STATS SECTION */}

            <section className="stats-section">

                <div className="stat-box">
                    <h1>10K+</h1>
                    <p>Active Users</p>
                </div>

                <div className="stat-box">
                    <h1>500+</h1>
                    <p>Recruiters</p>
                </div>

                <div className="stat-box">
                    <h1>3000+</h1>
                    <p>Jobs Posted</p>
                </div>

            </section>

            {/* TESTIMONIALS */}

            <section className="testimonial-section">

                <h1>Success Stories</h1>

                <div className="testimonial-grid">

                    <div className="testimonial-card">

                        <p>
                            “This portal helped me get my
                            first developer job.”
                        </p>

                        <h3>- Vinoth</h3>

                    </div>

                    <div className="testimonial-card">

                        <p>
                            “Recruiting candidates became
                            very easy.”
                        </p>

                        <h3>- HR Manager</h3>

                    </div>

                    <div className="testimonial-card">

                        <p>
                            “Best project-based job portal
                            experience.”
                        </p>

                        <h3>- Candidate</h3>

                    </div>

                </div>

            </section>

            {/* FOOTER */}

            <footer className="footer">

                <h2>JobPortal</h2>

                <p>
                    © 2026 All Rights Reserved.
                </p>

            </footer>
        </>
    );
}

export default Home;
