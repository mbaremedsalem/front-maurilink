import { WholeWord } from "lucide-react"

const EspaceRecriteur = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Espace Recruteur</h1>
      <p className="text-gray-700 mb-4">
        Bienvenue dans votre espace recruteur ! Ici, vous pouvez gérer vos offres d'emploi, consulter les candidatures et trouver les meilleurs talents pour votre entreprise.
      </p>
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">Gérer vos offres d'emploi</h2>
        <p className="text-gray-600 mb-4">
          Créez, modifiez et supprimez vos offres d'emploi pour attirer les candidats les plus qualifiés.
        </p>
        <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue      -600 transition duration-200">       Gérer les offres d'emploi</button>
      </div>
      <div className="bg-white shadow-md rounded-lg p-6 mt-6">
        <h2 className="text-2xl font-semibold mb-4">Consulter les candidatures</h2>
        <p className="text-gray-600 mb-4">
          Accédez à la liste des candidats qui ont postulé à vos offres d'emploi et examinez leurs profils.
        </p>
        <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-200">
          Consulter les candidatures
        </button>
      </div>
    </div>
  );
};

export default EspaceRecriteur;