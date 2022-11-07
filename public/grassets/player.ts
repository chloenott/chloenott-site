import { Scene } from "@babylonjs/core/scene";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { ActionManager } from "@babylonjs/core/Actions/actionManager";
import { ExecuteCodeAction } from "@babylonjs/core/Actions/directActions";
import { Vector3 } from "@babylonjs/core/Maths/math";
import { Mesh } from "@babylonjs/core";
import { Ray } from "@babylonjs/core/Culling/ray";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";

export default class Player {
    private inputMap: { [key: string]: boolean };
    private cameraTarget: Vector3;
    private cameraHeight: number;
    private movementSpeed: number;
    public mesh: Mesh;
    private upDirection: Vector3;
    private horizontalDirection: Vector3;
    private scene: Scene;
    private id: string;
    private minimumThresholdSpeed = 0.01;
    private camera: ArcRotateCamera;

    constructor(scene: Scene, id: string, camera: ArcRotateCamera, box: Mesh) {
      this.scene = scene;
      this.id = id;
      this.inputMap = {};
      this.cameraHeight = 8;
      this.movementSpeed = 0;
      this.upDirection = new Vector3(0, 0, 0);
      this.horizontalDirection = new Vector3(0, 0, 1);
      this.minimumThresholdSpeed = 0.01;
      this.camera = camera;

      this.mesh = box;
      this.mesh['velocity'] = new Vector3(0, 0, 0);
      this.camera.lockedTarget = this.mesh.position.add(new Vector3(0, 58, 0));

      this.setupInputTriggers();

      this.scene.registerBeforeRender(() => {
        this.updateVelocity();
        this.updateMovement();
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
        let movementSpeedMax = 1;        

        let velocityTangentially = new Vector3(0, 0, 0);
        let cameraDirection = Vector3.Zero();
        if (this.inputMap["w"] || this.inputMap["a"] || this.inputMap["s"] || this.inputMap["d"]) {
            this.movementSpeed = this.movementSpeed < movementSpeedMax ? this.movementSpeed*1.01 + 0.001 : movementSpeedMax;

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
          this.movementSpeed = this.movementSpeed*0.98;
          cameraDirection = this.mesh['velocity']; // todo: rename this to velocity direction?
        }

        this.mesh['velocity'] = this.upDirection.scale(Vector3.Dot(this.mesh['velocity'], this.upDirection));
        let cameraDirection_radialComponent = this.upDirection.scale(Vector3.Dot(cameraDirection, this.upDirection));
        let cameraDirection_tangentialComponent = cameraDirection.subtract(cameraDirection_radialComponent);
        velocityTangentially = cameraDirection_tangentialComponent.normalize().scale(this.inputMap["Shift"] ? this.movementSpeed*10 : this.movementSpeed);
        this.mesh['velocity'] = this.mesh['velocity'].add(velocityTangentially);
    }

    private updateMovement(): void {
      this.upDirection = new Vector3(0, 1, 0);

      let currentVelocity = this.mesh['velocity'];
      let velocityChangeFromGravity = this.upDirection.scale(-0.5);
      let updatedVelocity = currentVelocity.add(velocityChangeFromGravity).scale(this.scene.getAnimationRatio());

      let currentPosition = this.mesh.position;
      let updatedPosition = currentPosition.add(updatedVelocity);

      let groundDetectionRay_Origin = updatedPosition.add(new Vector3(0, 1000, 0));
      let groundDetectionRay_Direction = this.upDirection.scale(-1);
      let groundDetectionRay = new Ray(groundDetectionRay_Origin, groundDetectionRay_Direction, 2000);
      let groundPickInfo = this.scene.pickWithRay(groundDetectionRay, this.pickPredicate, true);

      // TODO: Every fox instance calls sendToServer; should only be Player.
      // if (currentPosition.subtract(updatedPosition).length() > 0.05 || 
      //     currentVelocity.subtract(updatedVelocity).length() > 0.05 ||
      //     Date.now() - this.time > 25000   // TODO: Ping mechanism at this interval should only send alive signal, not full object.
      //     ) {
      //         this.sendToServer(
      //             this.id,
      //             this.mesh.position,
      //             this.mesh['velocity']
      //         );
      // }

      if (groundPickInfo.pickedPoint && groundPickInfo.pickedPoint.y >= updatedPosition.y) {
          this.mesh.position = new Vector3(updatedPosition.x, groundPickInfo.pickedPoint.y, updatedPosition.z);
          this.mesh['velocity'] = new Vector3(updatedVelocity.x, 0, updatedVelocity.z);
      } else {
          this.mesh.position = updatedPosition;
          this.mesh['velocity'] = updatedVelocity;
      }

      let horizontalVelocity = new Vector3(updatedVelocity.x, 0, updatedVelocity.z);
      if (horizontalVelocity.length() > this.minimumThresholdSpeed) {
          this.horizontalDirection = horizontalVelocity.scale(10);
      };
      let vector3 = this.upDirection.cross(this.horizontalDirection);
      this.mesh.rotation = Vector3.RotationFromAxis(vector3, this.upDirection, this.horizontalDirection);
  }

  private pickPredicate(mesh: AbstractMesh): boolean {
    if (mesh.name.includes("ground")) {
        return true;
    } else {
        false;
    }
  }

}