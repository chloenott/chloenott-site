import { Scene } from "@babylonjs/core/scene";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { ActionManager } from "@babylonjs/core/Actions/actionManager";
import { ExecuteCodeAction } from "@babylonjs/core/Actions/directActions";
import { Color3, Vector3 } from "@babylonjs/core/Maths/math";
import { Mesh, StandardMaterial } from "@babylonjs/core";
import { Ray } from "@babylonjs/core/Culling/ray";
import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";

export default class Player {
    private inputMap: { [key: string]: boolean };
    private movementSpeed: number;
    public mesh: Mesh;
    private upDirection: Vector3;
    private horizontalDirection: Vector3;
    private scene: Scene;
    private minimumThresholdSpeed = 0.01;
    private camera: ArcRotateCamera;
    private previousPosition: Vector3;
    public velocity: Vector3;
    private interimVelocityCalc: Vector3;
    private meshHeightOffGround: number;
    private cameraHeightOffset: number;
    private movementCharge: number;

    constructor(scene: Scene, camera: ArcRotateCamera, playerMesh: Mesh) {
      this.scene = scene;
      this.inputMap = {};
      this.movementSpeed = 0;
      this.upDirection = new Vector3(0, 0, 0);
      this.horizontalDirection = new Vector3(0, 0, 1);
      this.minimumThresholdSpeed = 0.01;
      this.camera = camera;
      this.cameraHeightOffset = 4;
      this.movementCharge = 0;

      this.mesh = playerMesh;
      const material = new StandardMaterial("playerMaterial", this.scene);
      material.specularPower = 0;
      material.diffuseColor = new Color3(0.5, 0.5, 0.5);
      material.emissiveColor = new Color3(0.5, 0.5, 0.5);
      this.mesh.material = material;
      this.mesh.visibility = 0.5;

      this.meshHeightOffGround = 10;
      this.velocity = new Vector3(0, 0, 0);
      this.previousPosition = this.mesh.position.add(new Vector3(-10, -10, 0));
      this.interimVelocityCalc = new Vector3(0, 0, 0);
      this.camera.lockedTarget = this.mesh.position.add(new Vector3(-10, -10, 0));

      this.setupInputTriggers();

      this.scene.registerBeforeRender(() => {
        if (this.scene.getMeshByName("ground")?.isPickable) {
          const movementKeyPressed = this.inputMap["w"] || this.inputMap["a"] || this.inputMap["s"] || this.inputMap["d"];
          if (this.camera.fov < 1.6 && movementKeyPressed) {
            this.camera.fov = this.camera.fov + (1.4 - this.camera.fov) * 0.1 * scene.getEngine().getDeltaTime()/60;
          } else if (this.camera.fov > 1.2) {
            this.camera.fov = this.camera.fov - (this.camera.fov - 1.2) * 0.1 * scene.getEngine().getDeltaTime()/60;
          } else {
            this.camera.fov = 1.2;
          }
          this.updateVelocity();
          this.updateMovement();
          const changeFromLastFrame = this.mesh.position.subtract(this.previousPosition).scale(0.1);
          const newPosition = this.previousPosition.add(changeFromLastFrame);
          this.camera.lockedTarget = newPosition.add(new Vector3(0, this.cameraHeightOffset, 0));
          this.previousPosition = newPosition;
        }
      });
    }

    private setupInputTriggers() {
        this.scene.actionManager = new ActionManager(this.scene);

        this.scene.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnKeyDownTrigger, (ev) => {
            this.inputMap[ev.sourceEvent.key] = true;
        }));

        this.scene.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnKeyUpTrigger, (ev) => {
            this.inputMap[ev.sourceEvent.key] = false;
        }));
    }

    private updateVelocity(): void {
        const movementSpeedMax = 2;

        let velocityTangentially = new Vector3(0, 0, 0);
        let cameraDirection = Vector3.Zero();
        if (this.inputMap["w"] || this.inputMap["a"] || this.inputMap["s"] || this.inputMap["d"]) {
            if (this.movementCharge > 10) {
              this.movementSpeed = this.movementSpeed < movementSpeedMax ? movementSpeedMax : movementSpeedMax;
              cameraDirection = this.velocity; // todo: rename this to velocity direction?

              if (this.inputMap["w"]) {
                  cameraDirection = cameraDirection.add(this.camera.getDirection(new Vector3(0, 0, 1)));
              }
              if (this.inputMap["s"]) {
                  cameraDirection = cameraDirection.add(this.camera.getDirection(new Vector3(0, 0, -1)));
              }
              if (this.inputMap["a"]) {
                  cameraDirection = cameraDirection.add(this.camera.getDirection(new Vector3(-1, 0, 0)));
              }
              if (this.inputMap["d"]) {
                  cameraDirection = cameraDirection.add(this.camera.getDirection(new Vector3(1, 0, 0)));
              }
            } else {
              this.movementCharge += this.scene.getEngine().getDeltaTime()/60;
            }
        } else {
          this.movementCharge = 0;
          this.movementSpeed = this.movementSpeed*0.985;
          cameraDirection = this.velocity; // todo: rename this to velocity direction?
        }

        this.interimVelocityCalc = this.upDirection.scale(Vector3.Dot(this.velocity, this.upDirection));
        const cameraDirection_radialComponent = this.upDirection.scale(Vector3.Dot(cameraDirection, this.upDirection));
        const cameraDirection_tangentialComponent = cameraDirection.subtract(cameraDirection_radialComponent);
        velocityTangentially = cameraDirection_tangentialComponent.normalize().scale(this.inputMap["Shift"] ? this.movementSpeed*10 : this.movementSpeed);
        this.velocity = this.interimVelocityCalc.add(velocityTangentially);
    }

    private updateMovement(): void {
      this.upDirection = new Vector3(0, 1, 0);

      const currentVelocity = this.velocity;
      const velocityChangeFromGravity = this.upDirection.scale(-0.5);
      const updatedVelocity = currentVelocity.add(velocityChangeFromGravity).scale(this.scene.getAnimationRatio());

      const currentPosition = this.mesh.position;
      const updatedPosition = currentPosition.add(updatedVelocity);

      const groundDetectionRay_Origin = updatedPosition.add(new Vector3(0, 1000, 0));
      const groundDetectionRay_Direction = this.upDirection.scale(-1);
      const groundDetectionRay = new Ray(groundDetectionRay_Origin, groundDetectionRay_Direction, 2000);
      const groundPickInfo = this.scene.pickWithRay(groundDetectionRay, this.pickPredicate, true);

      if (groundPickInfo?.pickedPoint && groundPickInfo?.pickedPoint.y >= updatedPosition.y - this.meshHeightOffGround) {
          this.mesh.position = new Vector3(updatedPosition.x, groundPickInfo.pickedPoint.y + this.meshHeightOffGround, updatedPosition.z);
          this.interimVelocityCalc = new Vector3(updatedVelocity.x, 0, updatedVelocity.z);
      } else {
          this.mesh.position = updatedPosition;
          this.interimVelocityCalc = updatedVelocity;
      }

      const horizontalVelocity = new Vector3(updatedVelocity.x, 0, updatedVelocity.z);
      if (horizontalVelocity.length() > this.minimumThresholdSpeed) {
          this.horizontalDirection = horizontalVelocity.scale(10);
      }
      const vector3 = this.upDirection.cross(this.horizontalDirection);
      this.mesh.rotation = Vector3.RotationFromAxis(vector3, this.upDirection, this.horizontalDirection);
  }

  private pickPredicate(mesh: AbstractMesh): boolean {
    if (mesh.name.includes("ground")) {
        return true;
    } else {
        return false;
    }
  }

}