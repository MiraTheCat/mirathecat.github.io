import pygame, math, random
pygame.init()
clock = pygame.time.Clock()
WIDTH = 800
HEIGHT = 600
screen = pygame.display.set_mode((WIDTH, HEIGHT))

partikler = []

class Partikkel():
    def __init__(self,x,y):
        # x,y,fartx,farty,liv
        self.x = x
        self.y = y
        self.fart_x = random.randint(-10,10)
        self.fart_y = random.randint(-20,2)
        self.liv = random.randint(6,15)
        self.farge = 255
    
    def update(self):
        self.x += self.fart_x
        self.y += self.fart_y
        self.fart_y += 0.5
        self.liv -= 0.5
        self.farge -= 7
        
        if self.x > WIDTH or self.x < 0:
            self.fart_x *= -1
        
        if self.y > HEIGHT:
            self.fart_y *= -1
        
        if self.liv < 1:
            partikler.remove(self)
            del self
    
    def draw(self):
        pygame.draw.circle(screen,(255,self.farge,0),(int(self.x),int(self.y)),int(self.liv))

# Ferdig med partikkelklassen

def eksplosjon(mx,my):
################ CHANGE THIS NUMBER TO CHANGE THE AMOUNT OF PARTICLES ################
    for i in range(60):
        minPartikkel = Partikkel(mx,my)
        partikler.append(minPartikkel)

while True:
    
    screen.fill((0,0,0))
    
    for partikkel in partikler[::-1]:
        partikkel.update()
        partikkel.draw()
       
    clock.tick(30)
    pygame.display.update()
   
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False
        if event.type == pygame.MOUSEMOTION:
            mx,my = pygame.mouse.get_pos()
            eksplosjon(mx,my)
     
pygame.quit()