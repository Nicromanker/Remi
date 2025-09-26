import { useState } from 'react';
import {
  Card,
  Input,
  Button,
  Typography,
} from "@material-tailwind/react";

const App = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Add your login logic here
  };

  return (
	<div className="min-h-screen bg-blue-100 flex">
	  {/* Left side - Login Form */}
	  <div className="flex-1 flex flex-col justify-center lg-3/5 py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
		<div className="mx-auto w-full max-w-sm lg:max-w-md">
        <Typography color="blue-gray" className="text-center text-2xl font-semibold">
          Welcome to REMI
        </Typography>
        <Typography color="gray" className="mt-2 text-center text-md">
		  Recursos Eficientes Mejores Iniciativas
        </Typography>
      </div>

      <div className="mt-8 mx-auto w-full max-w-md">
        <Card color="white" className="p-8">
          <form className="space-y-10" onSubmit={handleSubmit}>
            <Input
              size="lg"
              label="Email Address"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />

            <Input
              size="lg"
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
            />

            <Button
              type="submit"
              fullWidth
              variant="filled"
              className="bg-blue-500 hover:bg-blue-600 rounded-lg"
            >
              Conectarse
            </Button>
          </form>

        </Card>
      </div>
	  </div>
		<div className="hidden lg:block relative flex-1">
	<div className="">
    <img
      className="object-contain max-h-screen py-24 mx-20"
      src="public/rat.png"
      alt="Login background"
    />
	</div>
  </div>
    </div>
  );
};

export default App;
