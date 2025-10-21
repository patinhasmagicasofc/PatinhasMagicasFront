var canvas = $('canvas')[0];
var context = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

var Projectile;
var State = false;
var Explode = false;
var Collapse = false;
var Particles = [];

var colors = ["#5cb85c", "#f39c12", "#5dade2", "#af7ac5", "#d2b48c", "#f1948a", "#f7dc6f"];

// --- FUNÇÃO PARA GERAR PATINHA SVG COLORIDA ---
function createColoredPaw(color, size) {
    var svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 64 64">
      <!-- Almofadinha central -->
      <ellipse cx="32" cy="44" rx="12" ry="10" fill="${color}" />
      <!-- Dedos -->
      <ellipse cx="20" cy="28" rx="6" ry="8" fill="${color}" />
      <ellipse cx="28" cy="20" rx="6" ry="8" fill="${color}" />
      <ellipse cx="40" cy="20" rx="6" ry="8" fill="${color}" />
      <ellipse cx="48" cy="28" rx="6" ry="8" fill="${color}" />
    </svg>`;
    var img = new Image();
    img.src = 'data:image/svg+xml;base64,' + btoa(svg);
    return img;
}

// --- PROJECTILE ---
function Proj() {
  this.radius = 10.2;
  this.x = Math.random() * canvas.width;
  this.y = canvas.height + this.radius;
  this.color = "#e74c3c";
  this.velocity = {x: 0, y: 0};
  this.speed = 12;
}

Proj.prototype = {
  Update: function() {
    if(this.x > (canvas.width / 2) && this.x - (canvas.width / 2) <= 10 || this.x < (canvas.width / 2) && (canvas.width / 2) - this.x <= 10) {
      Explode = true;
      $('.Nav').addClass('active');
    } else {
      this.dx = (canvas.width / 2) - this.x;
      this.dy = (canvas.height / 2) - this.y;
      this.distance = Math.sqrt(this.dx * this.dx + this.dy * this.dy);
      this.velocity.x = (this.dx/this.distance) * this.speed;
      this.velocity.y = (this.dy/this.distance) * this.speed;
      this.x += this.velocity.x;
      this.y += this.velocity.y;
    }
  },

  Draw: function() {
    context.beginPath();
    context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    context.fillStyle = this.color;
    context.fill();
    context.closePath();
  }
};

// --- PARTICLES COM PATINHAS SVG ---
function Particle() {
  this.x = canvas.width / 2;
  this.y = canvas.height / 2;
  this.radius = 12 + Math.random() * 4; // leve variação de tamanho
  this.color = colors[Math.floor(Math.random() * colors.length)];
  this.img = createColoredPaw(this.color, this.radius*2);

  // mesma velocidade aleatória do código original
  this.velocity = {
    x: (Math.random() < 0.5 ? -1 : 1) * Math.random() * 10,
    y: (Math.random() < 0.5 ? -1 : 1) * Math.random() * 10
  };

  this.speed = 25; // usado somente se Collapse
  this.active = true;
}

Particle.prototype = {
  Update: function() {
    if(Collapse) {
      this.dx = (canvas.width / 2) - this.x;
      this.dy = (canvas.height / 2) - this.y;
      this.distance = Math.sqrt(this.dx * this.dx + this.dy * this.dy);
      this.velocity.x = (this.dx/this.distance) * this.speed;
      this.velocity.y = (this.dy/this.distance) * this.speed;
      this.x += this.velocity.x;
      this.y += this.velocity.y;

      if(this.x > (canvas.width / 2) && this.x - (canvas.width / 2) <= 15 || this.x < (canvas.width / 2) && (canvas.width / 2) - this.x <= 15) {
        if(this.y > (canvas.height / 2) && this.y - (canvas.height / 2) <= 15 || this.y < (canvas.height / 2) && (canvas.height / 2) - this.y <= 15) {
          this.active = false;
        }
      }
    } else {
      this.x += this.velocity.x;
      this.y += this.velocity.y;
    }
  },

  Draw: function() {
    context.save();
    context.translate(this.x, this.y);
    context.rotate(0);
    context.drawImage(this.img, -this.radius, -this.radius, this.radius*2, this.radius*2);
    context.restore();
  }
};

// --- ATUALIZAÇÃO ---
function Update() {
  if(Particles.length < 70) {
    for(var x = Particles.length; x < 70; x++) {
      Particles.push(new Particle());
    }
  }
  
  if(Explode || Collapse) {
    Particles.forEach(function(particle) {
      particle.Update();
    });
  }

  Particles = Particles.filter(function(particle) {
    return particle.active;
  });

  if(State && !Explode) {
    Projectile.Update();
  }

  Render();
  requestAnimationFrame(Update);
}

// --- RENDER ---
function Render() {
  context.clearRect(0, 0, canvas.width, canvas.height);

  if(Collapse || Explode) {
    Particles.forEach(function(particle) {
      particle.Draw();
    });
  }

  if(State && !Explode) {
    Projectile.Draw();
  }
}

// --- BOTÃO ---
$('#Button').click(function() {
  State = !State;

  if(Explode && State == false) { 
    Collapse = true;
  } else {
    Collapse = false;
    Particles = [];
  }

  if(State) {
    Projectile = new Proj();
  } else {
    Projectile = null;
    Explode = false;
  }

  if(!State) {
    $('.Nav').removeClass('active');
  }
  $(this).toggleClass('fa-fire');
  $(this).toggleClass('fa-times');
});

// --- INICIA ANIMAÇÃO ---
$(document).ready(function() {
  Update();
});

// --- RESIZE ---
$(window).resize(function() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});



//Circus

// var canvas = $('canvas')[0];
// var context = canvas.getContext('2d');

// canvas.width = window.innerWidth;
// canvas.height = window.innerHeight;

// var Projectile;
// var State = false;
// var Explode = false;
// var Collapse = false;
// var Particles = [];

// var colors = ["#1abc9c", "#2ecc71", "#3498db", "#9b59b6", "#9b59b6", "#f1c40f", "#e67e22", "#e74c3c"];

// function Proj() {
//   this.radius = 5.2;
//   this.x = Math.random() * canvas.width;
//   this.y = canvas.height + this.radius;
//   this.color = "#e74c3c";
//   this.velocity = {x: 0, y: 0};
//   this.speed = 12;
// }

// Proj.prototype = {
//   Update: function() {
//     if(this.x > (canvas.width / 2) && this.x - (canvas.width / 2) <= 10 || this.x < (canvas.width / 2) && (canvas.width / 2) - this.x <= 10) {
//       Explode = true;
//       $('.Nav').addClass('active');
//     } else {
//       this.dx = (canvas.width / 2) - this.x;
//       this.dy = (canvas.height / 2) - this.y;
//       this.distance = Math.sqrt(this.dx * this.dx + this.dy * this.dy);
//       this.velocity.x = (this.dx/this.distance) * this.speed;
//       this.velocity.y = (this.dy/this.distance) * this.speed;
//       this.x += this.velocity.x;
//       this.y += this.velocity.y;
//     }
//   },

//   Draw: function() {
//     context.beginPath();
//     context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
//     context.fillStyle = this.color;
//     context.fill();
//     context.closePath();
//   }
// };

// function Particle() {
//   this.x = canvas.width / 2;
//   this.y = canvas.height / 2;
//   this.radius = 4;
//   this.color = colors[Math.round(Math.random() * (colors.length + 1))];

//   this.velocity = {x: (Math.random() < 0.5 ? -1 : 1) * Math.random() * 10, y: (Math.random() < 0.5 ? -1 : 1) * Math.random() * 10};
//   this.speed = 25;
//   this.active = true;
// }

// Particle.prototype = {
//   Update: function() {
//     if(Collapse) {
//       this.dx = (canvas.width / 2) - this.x;
//       this.dy = (canvas.height / 2) - this.y;
//       this.distance = Math.sqrt(this.dx * this.dx + this.dy * this.dy);
//       this.velocity.x = (this.dx/this.distance) * this.speed;
//       this.velocity.y = (this.dy/this.distance) * this.speed;
//       this.x += this.velocity.x;
//       this.y += this.velocity.y;

//       if(this.x > (canvas.width / 2) && this.x - (canvas.width / 2) <= 15 || this.x < (canvas.width / 2) && (canvas.width / 2) - this.x <= 15) {
//         if(this.y > (canvas.height / 2) && this.y - (canvas.height / 2) <= 15 || this.y < (canvas.height / 2) && (canvas.height / 2) - this.y <= 15) {
//           this.active = false;
//         }
//       }
//     } else {
//       this.x += this.velocity.x;
//       this.y += this.velocity.y;
//     }
//   },

//   Draw: function() {
//     context.beginPath();
//     context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
//     context.lineWidth = 2.2;
//     context.strokeStyle = this.color;
//     context.stroke();
//     context.closePath();
//   }
// };

// function Update() {
//   if(Particles.length < 100) {
//     for(var x = Particles.length; x < 100; x++) {
//       Particles.push(new Particle());
//     }
//   }
  
//   if(Explode || Collapse) {
//     Particles.forEach(function(particle) {
//       particle.Update();
//     });
//   }

//   Particles = Particles.filter(function(particle) {
//     return particle.active;
//   });

//   if(State && !Explode) {
//     Projectile.Update();
//   }

//   Render();
//   requestAnimationFrame(Update);
// }

// function Render() {
//   context.clearRect(0, 0, canvas.width, canvas.height);

//   if(Collapse || Explode) {
//     Particles.forEach(function(particle) {
//       particle.Draw();
//     });
//   }

//   if(State && !Explode) {
//     Projectile.Draw();
//   }
// }

// $('#Button').click(function() {
//   State = !State;

//   if(Explode && State == false) { 
//     Collapse = true;
//   } else {
//     Collapse = false;
//     Particles = [];
//   }

//   if(State) {
//     Projectile = new Proj();
//   } else {
//     Projectile = null;
//     Explode = false;
//   }

//   if(!State) {
//     $('.Nav').removeClass('active');
//   }
//   $(this).toggleClass('fa-fire');
//   $(this).toggleClass('fa-times');
// });

// $(document).ready(function() {
//   Update();
// });

// $(window).resize(function() {
//   canvas.width = window.innerWidth;
//   canvas.height = window.innerHeight;
// });





// --- FECHAR NAV AO CLICAR FORA ---
$(document).click(function(e) {
  if(!$(e.target).closest('.Nav, #Button').length) {
    $('.Nav').removeClass('active');
    if(State) {
      State = false;
      Projectile = null;
      Explode = false;
      Collapse = true;
      $('#Button').removeClass('fa-times').addClass('fa-fire');
    }
  }
});
