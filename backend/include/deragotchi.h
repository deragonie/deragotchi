#ifndef DERAGOTCHI_H
#define DERAGOTCHI_H

#include <bits/stdc++.h>
using namespace std;
using namespace std::chrono;
#include <string>
#include <chrono>

class deragotchi {
private: 
    string name;
    int hunger, happiness,
    cleanliness, energy;
    bool isAlive, isSleeping;
    steady_clock::time_point lastUpd;

public:
    deragotchi(string name);
    void feed();
    void play();
    void sleep();
    void clean();
    void wakeywakey();
    void upd();

    //getters
    string getName() const {
      return name;
    }
    int getHungry() const {
      return hunger;
    }
    int getHappiness() const {
      return happiness;
    }
    int getEnergy() const {
      return energy;
    }
    int getClean() const {
      return cleanliness;
    }
    bool getAlive() const {
      return isAlive;
    }
    bool getSleeping() const {
      return isSleeping;
    }

    string getmood() const;
    string toJSON() const;
};

#endif
