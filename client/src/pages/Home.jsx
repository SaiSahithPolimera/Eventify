import { Link } from "react-router-dom";

const Home = () => {
    return (
        <section className="relative flex items-center justify-between min-h-screen bg-white overflow-hidden px-4 sm:px-8 lg:px-16">
            <div className="absolute left-0 top-0 w-full sm:w-[70%] lg:w-[60%] h-full bg-rose-400 rounded-r-[0%] sm:rounded-r-[50%]"></div>

            <div className="relative z-10 w-full sm:w-1/2 py-8 sm:py-2 flex flex-col justify-center text-white gap-4">
                <div className="flex flex-col gap-3">
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-sans">
                        Eventify
                    </h1>
                    <p className="text-sm sm:text-base lg:text-lg mb-4 sm:mb-8 font-sans max-w-md text-rose-50/90">
                        Create, manage, and promote your events effortlessly. Track attendees,
                        sell tickets, and stay organized — all in one place.
                    </p>
                </div>
                <Link
                    to="/login"
                    className="bg-white text-rose-500 px-6 py-2.5 sm:py-3 rounded-lg font-semibold shadow hover:bg-rose-50/80 transition-all w-fit text-sm sm:text-base"
                >
                    Get Started
                </Link>
            </div>

        </section>
    );
};

export default Home;