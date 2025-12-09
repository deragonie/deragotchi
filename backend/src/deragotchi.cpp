#include "deragotchi.h"
#include <iostream>
#include <sstream>
#include <chrono>

using namespace std;
using namespace std::chrono;

deragotchi::deragotchi(string name) :
  name(name), hunger(50), happiness(50),
  cleanliness(50), energy(50),
  isAlive(true), isSleeping(false) {
    lastUpd = steady_clock::now();
  }

/*feed the pet, increasing happiness and energy
also decreasing the hunger and cleanliness*/
void deragotchi::feed(){
  if (!isAlive or isSleeping) return;
  hunger = min(100, hunger-20);
  energy = min(100, energy+10);
  cleanliness = max(0, cleanliness-10);
  happiness = min(100, happiness+5);
  upd();
}

/*play with the pet increasing happinnes,
but the pet gets tired and dirty*/
void deragotchi::play(){
  if (!isAlive or isSleeping) return;
  happiness = min(100, happiness+30);
  energy = max(0, energy-15);
  cleanliness = max(0,cleanliness-20);
  upd();
}

/*put the pet to sleep to recover energy*/
void deragotchi::sleep(){
  if (!isAlive or isSleeping) return;
  isSleeping = true;
  energy = min(100, energy+40);
  upd();
}

/*bath the pet to increase their cleanliness
but they get sad because they dont like baths*/
void deragotchi::clean(){
  if (!isAlive or isSleeping) return;
  cleanliness = min(100, cleanliness+30);
  happiness = max(0,happiness-5);
  upd();
}

/*wake up the deragotchi after sleep*/
void deragotchi::wakeywakey(){
  if (!isAlive or !isSleeping) return;
  isSleeping = false;
  upd();
}

/*update the state of deragotchi in time,
it decreases or increase the value of
states over time*/
void deragotchi::upd(){
  auto now = steady_clock::now();
  long lapsed = duration_cast<seconds>(now-lastUpd).count();

  if (lapsed<1) return;

  if (!isSleeping) {
    hunger = min(100, hunger+5);
    energy = max(0, energy-3);
    cleanliness = max(0, cleanliness-1);

    if (hunger>80) happiness = max(0,happiness-2);
    if (cleanliness<20) happiness = max(0,happiness-2);
  } else {
    energy = min(100, energy+10);
    if (energy>=100) wakeywakey();
  }
  
  if (hunger>=100 or happiness<=0){
    isAlive = false;
  }
  lastUpd = now;
}

/*getter that gets the mood and state of the pet*/
string deragotchi::getmood() const {
  if (!isAlive) return "dead x.x";
  if (isSleeping) return "mimiendo";
  if (hunger>65) return "hungy";
  if (cleanliness<30) return "dirty";
  if (happiness>60) return "happy c:";
  if (happiness<30) return "sad:(";
  return "normal";
}

string deragotchi::toJSON() const {
  stringstream json;
  json << "{"
     << "\"name\":\"" << name << "\","
     << "\"hunger\":" << hunger << ","
     << "\"happiness\":" << happiness << ","
     << "\"energy\":" << energy << ","
     << "\"cleanliness\":" << cleanliness << ","
     << "\"isAlive\":" << (isAlive ? "true" : "false") << ","
     << "\"isSleeping\":" << (isSleeping ? "true" : "false") << ","
     << "\"mood\":\"" << getmood() << "\""
     << "}";
  return json.str();
}
