// import { useAuth } from "./context/AuthContext";

// function App() {
//   const { loading, user, profile } = useAuth();

//   if (loading) {
//     return <h1>Loading...</h1>;
//   }

//   console.log(user);
//   console.log(profile);

//   return (
//     <div>
//       <h1>TownHall</h1>
//     </div>
//   );
// }

// export default App;
import { AppRouter } from "./routes/AppRouter";

export default function App() {
  return <AppRouter />;
}

