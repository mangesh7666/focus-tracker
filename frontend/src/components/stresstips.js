// src/components/StressTips.js
import React from "react";
import { Heart, Coffee, Moon, Dumbbell, Leaf, Clock, Smile } from "lucide-react";

const StressTips = () => {
  const categories = [
    {
      title: "Mental Health",
      tips: [
        { icon: <Smile size={20} className="me-2 text-warning" />, text: "Practice mindfulness or meditation." },
        { icon: <Clock size={20} className="me-2 text-primary" />, text: "Take short breaks throughout your workday." },
        
      ]
    },
    {
      title: "Physical Health",
      tips: [
        { icon: <Dumbbell size={20} className="me-2 text-success" />, text: "Exercise regularly to release tension." },
        { icon: <Moon size={20} className="me-2 text-info" />, text: "Maintain a consistent sleep schedule." }
      ]
    },
    {
      title: "Lifestyle",
      tips: [
        { icon: <Coffee size={20} className="me-2 text-warning" />, text: "Stay hydrated and eat balanced meals." },
        { icon: <Heart size={20} className="me-2 text-danger" />, text: "Practice deep breathing exercises to relax." }
      ]
    }
  ];

  return (
    <div className="row g-3">
      {categories.map((cat, idx) => (
        <div key={idx} className="col-12 col-md-4">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h5 className="card-title mb-3">{cat.title}</h5>
              <ul className="list-group list-group-flush">
                {cat.tips.map((tip, i) => (
                  <li key={i} className="list-group-item d-flex align-items-center">
                    {tip.icon}
                    <span>{tip.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StressTips;
